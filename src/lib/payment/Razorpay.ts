import Razorpay from "razorpay";
import { RAZORPAY_ID, RAZORPAY_SECRET } from "../../config/index.ts";

export const RazorpayClient = new Razorpay({
  key_id: RAZORPAY_ID || "",
  key_secret: RAZORPAY_SECRET,
  headers: {
    "Content-Type": "application/json",
  },
});
