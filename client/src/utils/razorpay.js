const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const loadScript = () =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async ({ orderId, amount, currency, name, description, prefill, onSuccess, onDismiss }) => {
  const loaded = await loadScript();
  if (!loaded) {
    throw new Error("Razorpay failed to load. Check your connection.");
  }

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const options = {
    key,
    amount,
    currency,
    name: name || "LocalMart",
    description: description || "Order payment",
    order_id: orderId,
    prefill: prefill || {},
    theme: { color: "#0f172a" },
    handler: (response) => onSuccess(response),
    modal: { ondismiss: () => onDismiss?.() },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
