import Payment from "../models/PaymentSchema.js";
import User from "../models/UserSchema.js";

const BASE_URL = "https://api-m.sandbox.paypal.com";
// https://sandbox.paypal.com
// const BASE_URL = "https://sandbox.paypal.com";
const plans = {
  Plus: "2.00",
  Advanced: "5.00",
};
export const generateAccessToken=async()=>{
const clientId=process.env.PAYPAL_CLIENT_ID
const clientSecret=process.env.PAYPAL_CLIENT_SECRET
if(!clientId|| !clientSecret){
    console.log('data is missing clientId or clientSecret')
    return 
}
  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response=await fetch(
      `${BASE_URL}/v1/oauth2/token`,
      {
        method:"POST",
         headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
       body: "grant_type=client_credentials",
      }
  )
  const data=await response.json()
    if (!response.ok) {
    throw new Error(data.error_description || "PayPal authentication failed");
  }

  return data.access_token;

}

export const paymentTest=async(req,res)=>{
    try{
        const token=await generateAccessToken()

                 res.json({
      success: true,
      message: "PayPal connected successfully!",
      tokenReceived: Boolean(token),
    });

    }
    catch(err){
            res.status(500).json({
      success: false,
      message: err.message,
    });
    }
}

export const createOrder=async(req,res)=>{
try{
    const {planName}=req.body
    const price=plans[planName]
    if(!price){
            return res.status(400).json({
        message: "Invalid plan selected",
      });
    }
    const accessToken=await generateAccessToken()
     const response = await fetch(
      `${BASE_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: price,
              },
            },
          ],
        }),
      }
    );
        const data=await response.json()
        
          if (!response.ok) {
      return res.status(response.status).json({
        message: "PayPal order creation failed",
        details: data,
      });
    }
    const userId = req.auth.payload.sub;

await Payment.create({
  userId,
  orderId: data.id,
  planName,
  amount: price,
  currency: "USD",
  status: "CREATED",
});


    const approvalUrl = data.links?.find(
  (link) =>
    link.rel === "payer-action" ||
    link.rel === "approve"
)?.href;

    // Step 3: Send the order ID to React
    return res.status(201).json({
      success: true,
      orderId: data.id,
      status: data.status,
      approvalUrl
    });

}
catch(err){
      console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
}

}

export const captureOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.auth.payload.sub;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    // 1. Find this user's saved payment
    const paymentRecord = await Payment.findOne({
      orderId,
      userId,
    });

    if (!paymentRecord) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    if (paymentRecord.status === "COMPLETED") {
      return res.status(409).json({
        message: "Payment already processed",
      });
    }

    // 2. Obtain a PayPal access token
    const accessToken = await generateAccessToken();

    // 3. Ask PayPal to capture the approved order
    const response = await fetch(
      `${BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Payment capture failed",
        details: data,
      });
    }

    // 4. Extract captured payment information
    const capture =
      data.purchase_units?.[0]?.payments?.captures?.[0];

    // 5. Verify payment status
    const validStatus =
      data.id === orderId &&
      data.status === "COMPLETED" &&
      capture?.status === "COMPLETED";

    // 6. Verify the actual captured amount
    const validAmount =
      capture?.amount?.value === paymentRecord.amount &&
      capture?.amount?.currency_code === paymentRecord.currency;

    if (!validStatus || !validAmount) {
      return res.status(409).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 7. Update the payment record
    paymentRecord.status = "COMPLETED";
    paymentRecord.captureId = capture.id;

    await paymentRecord.save();

    // 8. Upgrade the user's plan
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        $set: { plan: paymentRecord.planName },
        $setOnInsert: { userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // 9. Return the updated plan to React
    return res.status(200).json({
      success: true,
      message: "Payment completed and plan updated",
      planName: updatedUser.plan,
      captureId: capture.id,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
