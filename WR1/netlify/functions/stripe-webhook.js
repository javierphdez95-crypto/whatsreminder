import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const handler = async (event) => {
  // Solo aceptamos POST (Stripe)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig =
    event.headers["stripe-signature"] ||
    event.headers["Stripe-Signature"];

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
   const rawBody = event.isBase64Encoded
  ? Buffer.from(event.body, "base64").toString("utf8")
  : event.body;

stripeEvent = stripe.webhooks.constructEvent(
  rawBody,
  sig,
  webhookSecret
);

  } catch (err) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    // Generamos token seguro
    const token = crypto.randomBytes(24).toString("hex");

    // Cliente Supabase con service role (solo servidor)
    const sbAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await sbAdmin
  .from("access_tokens")
  .insert([{
    token,
    active: true,
    stripe_session_id: session.id
  }]);


    if (error) {
      return {
        statusCode: 500,
        body: `Supabase error: ${error.message}`,
      };
    }

    return { statusCode: 200, body: "ok" };
  }

  return { statusCode: 200, body: "ignored" };
};
