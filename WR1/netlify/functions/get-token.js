import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  try {
    const sessionId = event.queryStringParameters?.session_id;
    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing session_id" }),
      };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error("Missing env vars", { hasUrl: !!url, hasKey: !!key });
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Netlify env vars" }),
      };
    }

    const sbAdmin = createClient(url, key);

    const { data, error } = await sbAdmin
  .from("access_tokens")
  .select("token")
  .eq("stripe_session_id", sessionId)
  .maybeSingle();

if (error) {
  console.error("Supabase select error:", error);
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: error.message, details: error }),
  };
}

if (!data?.token) {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Token not found for this session_id" }),
  };
}

return {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: data.token }),
};


    if (error) {
      console.error("Supabase select error:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: error.message, details: error }),
      };
    }

    if (!data?.token) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Token not found for this session_id" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.token }),
    };
  } catch (e) {
    console.error("get-token crash:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
