import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

export default {
  async scheduled(event, env, ctx) {
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    );

    const now = new Date().toISOString();

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("sent", false)
      .lte("send_at", now)
      .limit(10);

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    if (!reminders.length) {
      console.log("No reminders to send");
      return;
    }

    const client = twilio(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_AUTH_TOKEN
    );

    for (const r of reminders) {
      try {
        await client.messages.create({
          from: env.TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${r.phone}`,
          body: r.message
        });

        await supabase
          .from("reminders")
          .update({
            sent: true,
            sent_at: new Date().toISOString()
          })
          .eq("id", r.id);

        console.log("Sent reminder:", r.id);
      } catch (e) {
        console.error("Twilio error:", e);
      }
    }
  }
};
