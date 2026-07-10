declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (
        event: string,
        handler: (response: RazorpayFailureResponse) => void,
      ) => void;
    };
  }
}

export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  callback_url?: string;
  redirect?: boolean;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailureResponse = {
  error?: {
    description?: string;
    reason?: string;
  };
};

let razorpayScriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout(
  options: Omit<RazorpayCheckoutOptions, "handler">,
): Promise<RazorpaySuccessResponse> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Could not load Razorpay checkout.");
  }

  return new Promise((resolve, reject) => {
    const instance = new window.Razorpay!({
      ...options,
      handler: (response) => resolve(response),
      modal: {
        ...options.modal,
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });

    instance.on("payment.failed", (response) => {
      reject(
        new Error(
          response?.error?.description ??
            response?.error?.reason ??
            "Payment failed.",
        ),
      );
    });

    instance.open();
  });
}

type LaunchRazorpayCheckoutInput = {
  options: Omit<RazorpayCheckoutOptions, "handler">;
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (message: string) => void;
};

/** Opens Razorpay without blocking until payment completes (needed for redirect flows). */
export async function launchRazorpayCheckout(
  input: LaunchRazorpayCheckoutInput,
): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Could not load Razorpay checkout.");
  }

  const instance = new window.Razorpay!({
    ...input.options,
    handler: (response) => {
      void input.onSuccess(response);
    },
    modal: {
      ...input.options.modal,
      ondismiss: () => input.onDismiss?.(),
    },
  });

  instance.on("payment.failed", (response) => {
    input.onFailure?.(
      response?.error?.description ??
        response?.error?.reason ??
        "Payment failed.",
    );
  });

  instance.open();
}
