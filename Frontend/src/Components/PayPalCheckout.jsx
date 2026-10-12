import React from "react";

import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import { useAuth0 } from "@auth0/auth0-react";

import api from "../api";

function PayPalCheckout({ planName, onPlanChange,onPaymentComplete }) {
  const { getAccessTokenSilently } = useAuth0();

  const createOrder = async () => {
    const token = await getAccessTokenSilently();
    const response = await api.post("/payment/createOrder", {
      planName,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      orderId: response.data.orderId,
    };
  };

  const onApprove = async ({ orderId }) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await api.post("/payment/captureOrder", {
        orderId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        throw new Error("Payment capture failed");
      }

      onPlanChange?.(response.data.planName);
      onPaymentComplete?.()
      alert("Payment completed successfully!");

    } catch (error) {
      console.error("Payment capture error:", error);
      alert("Unable to confirm the payment.");
      throw error;
    }
  };

  return (
    // it sets the environment 
    
    <PayPalProvider
      clientId={import.meta.env.VITE_PAYPAL_CLIENT_ID}
      environment="sandbox"
      components={["paypal-payments"]}
      pageType="checkout"
    >
      <PayPalOneTimePaymentButton
        createOrder={createOrder}
        onApprove={onApprove}

        onCancel={() => {
          console.log("Payment cancelled");
        }}

        onError={(error) => {
          console.error("PayPal error:", error);
          alert("Payment could not be completed");
        }}
      />
    </PayPalProvider>
  );
}

export default PayPalCheckout;
