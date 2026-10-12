import React, { useEffect, useRef, useState } from "react";
import "../../public/ShowPlanPage.css";
import PayPalCheckout from "./PayPalCheckout";

// Edit these sample features and add your paid prices when ready.
const plans = [
  { name: "Free-tier", title: "Start with the basics", description: "Explore ideas, find answers, and get help with everyday tasks.", price: "0", features: ["Everyday text chats", "Basic writing assistance", "Standard usage limits", "Help with everyday questions"] },
  { name: "Plus", title: "Your everyday AI assistant", description: "More room to write, learn, and bring your ideas to life.", price: "2", featured: true, features: ["Everything in Free-tier", "More messages and usage", "Advanced writing and coding help", "Expanded access to tools", "More capacity for your projects"] },
  { name: "Advanced", title: "Power for bigger ideas", description: "Go further with demanding tasks and ambitious projects.", price: "5", features: ["Everything in Plus", "Higher usage limits", "Support for complex projects", "Expanded access to advanced tools", "Priority access"] },
];

function ShowPlanPage({ currentPlan, onClose, onPlanChange }) {
  const closeRef = useRef(null);
  const [selectedPlan,setSelectedPlan]=useState(null)
  const handlePayment=(plan)=>{
    setSelectedPlan(plan)

  }
  useEffect(() => {
    // so that when we close the page it should focus on the tab which we are focusing
    // eariler before opening the plans page
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      // Close is the only enabled control until purchase actions are added.
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="plans-overlay" role="dialog" aria-modal="true" aria-labelledby="plans-title">
      <button ref={closeRef} type="button" className="plans-close" onClick={onClose} aria-label="Close plans">×</button>
      <div className="plans-content">
        <header className="plans-header">
          <h1 id="plans-title">Choose the right plan for you</h1>
          <p>Everyday help. More possibilities. A plan for every idea.</p>
          <span className="plans-category">Personal plans</span>
        </header>
        <div className="plans-grid">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            return (
              <article className={`plan-card${plan.featured ? " plan-card-featured" : ""}`} key={plan.name}>
                <div className="plan-card-top">
                  <h2>{plan.name}</h2>
                  {plan.featured && <span className="plan-badge">Recommended</span>}
                </div>
                <h3>{plan.title}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-price">
                  {plan.price !== null ? <><span className="plan-currency">$</span><strong>{plan.price}</strong><span>/ month</span></> : <strong className="plan-price-pending">Price coming soon</strong>}
                </div>
                <button type="button"  disabled={isCurrent} className={`plan-action${isCurrent ? " plan-action-current" : ""}`} onClick={()=>handlePayment(plan.name)}>
                  {isCurrent ? "Your current plan" : "Buy now"}
                </button>
                <p className="plan-features-title">{plan.name === "Free-tier" ? "Start with the essentials:" : "Unlock more possibilities:"}</p>
                <ul className="plan-features">
                  {plan.features.map((feature) => <li key={feature}><span aria-hidden="true" className="plan-check">✓</span>{feature}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
        {selectedPlan && (
  <div className="paypal-checkout">
    <h3>Continue with PayPal</h3>

    <PayPalCheckout
      key={selectedPlan}
      planName={selectedPlan}
      onPlanChange={onPlanChange}
      onPaymentComplete={onClose}
    />

    <button
      type="button"
      onClick={() => setSelectedPlan(null)}
    >
      Cancel
    </button>
  </div>
)}
      </div>
    </div>
  );
}

export default ShowPlanPage;
