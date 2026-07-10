export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

  if (!keyId || !keySecret) {
    return null;
  }

  return {
    keyId,
    keySecret,
    webhookSecret: webhookSecret ?? "",
  };
}

export function isRazorpayEnabled(): boolean {
  return Boolean(getRazorpayConfig());
}

export function inrToPaise(amountInr: number): number {
  return Math.round(Number(amountInr) * 100);
}
