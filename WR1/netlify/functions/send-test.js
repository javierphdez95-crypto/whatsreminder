import twilio from "twilio";

export const handler = async (event) => {
  try {
    const to = event.queryStringParameters?.to;
    const body = event.queryStringParameters?.body;

    if (!to || !body) {
      return {
        statusCode: 400,
        body: "Falta ?to=whatsapp:+34...&body=..."
      };
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to,
      body
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, sid: msg.sid })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: String(e)
    };
  }
};
