import crypto from "crypto";
import Razorpay from "razorpay";
import {
  getRazorpayConfig,
  inrToPaise,
  type RazorpayConfig,
} from "@/lib/payments/razorpay-config";

export function requireRazorpayConfig(): RazorpayConfig {
  const config = getRazorpayConfig();
  if (!config) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }
  return config;
}

export function createRazorpayClient(config: RazorpayConfig = requireRazorpayConfig()) {
  return new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
}

export async function createRazorpayOrder(input: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = createRazorpayClient();
  const amount = inrToPaise(input.amountInr);

  if (amount < 100) {
    throw new Error("Order amount must be at least ₹1.");
  }

  const order = await client.orders.create({
    amount,
    currency: "INR",
    receipt: input.receipt.slice(0, 40),
    notes: input.notes,
  });

  return order;
}

export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  keySecret?: string;
}): boolean {
  const secret = input.keySecret ?? requireRazorpayConfig().keySecret;
  const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return expected === input.razorpaySignature;
}

export function verifyRazorpayWebhookSignature(input: {
  rawBody: string;
  signature: string;
  webhookSecret?: string;
}): boolean {
  const secret =
    input.webhookSecret ?? requireRazorpayConfig().webhookSecret;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(input.rawBody)
    .digest("hex");

  return expected === input.signature;
}
