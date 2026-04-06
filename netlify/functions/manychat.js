// ManyChat API proxy — single function handling all ManyChat operations
// API key is passed from the frontend (stored in localStorage/app state)
// In production, you'd store it as a Netlify environment variable

const MC_BASE = "https://api.manychat.com/fb";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-MC-Key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

// Helper: proxy a request to ManyChat
async function mcFetch(path, apiKey, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (body && method === "POST") opts.body = JSON.stringify(body);

  const url = `${MC_BASE}${path}`;
  const res = await fetch(url, opts);
  const data = await res.json();
  return { status: res.status, data };
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  // Get API key from header
  const apiKey =
    event.headers["x-mc-key"] || event.headers["X-MC-Key"] || "";
  if (!apiKey) {
    return {
      statusCode: 401,
      headers: CORS,
      body: JSON.stringify({ error: "Missing ManyChat API key. Set it in Settings." }),
    };
  }

  // Parse the action from query string or body
  const params = event.queryStringParameters || {};
  const action = params.action || "";
  let bodyData = {};
  try {
    if (event.body) bodyData = JSON.parse(event.body);
  } catch (e) {}

  try {
    let result;

    switch (action) {
      // ═══════════════════════════════════════════
      // PAGE / ACCOUNT INFO
      // ═══════════════════════════════════════════
      case "page_info":
        result = await mcFetch("/page/getInfo", apiKey);
        break;

      case "get_tags":
        result = await mcFetch("/page/getTags", apiKey);
        break;

      case "get_flows":
        result = await mcFetch("/page/getFlows", apiKey);
        break;

      case "get_custom_fields":
        result = await mcFetch("/page/getCustomFields", apiKey);
        break;

      // ═══════════════════════════════════════════
      // SUBSCRIBER MANAGEMENT
      // ═══════════════════════════════════════════
      case "subscriber_info":
        // GET /fb/subscriber/getInfo?subscriber_id=XXX
        result = await mcFetch(
          `/subscriber/getInfo?subscriber_id=${params.subscriber_id}`,
          apiKey
        );
        break;

      case "find_by_name":
        // GET /fb/subscriber/findByName?name=XXX
        result = await mcFetch(
          `/subscriber/findByName?name=${encodeURIComponent(params.name || "")}`,
          apiKey
        );
        break;

      case "find_by_system_field":
        // GET /fb/subscriber/findBySystemField?...
        const sfKey = params.field_type || "email"; // email | phone
        result = await mcFetch(
          `/subscriber/findBySystemField?${sfKey}=${encodeURIComponent(params.field_value || "")}`,
          apiKey
        );
        break;

      case "find_by_custom_field":
        // GET /fb/subscriber/findByCustomField?field_id=X&field_value=Y
        result = await mcFetch(
          `/subscriber/findByCustomField?field_id=${params.field_id}&field_value=${encodeURIComponent(params.field_value || "")}`,
          apiKey
        );
        break;

      // ═══════════════════════════════════════════
      // TAGS
      // ═══════════════════════════════════════════
      case "add_tag":
        result = await mcFetch("/subscriber/addTagByName", apiKey, "POST", {
          subscriber_id: bodyData.subscriber_id,
          tag_name: bodyData.tag_name,
        });
        break;

      case "remove_tag":
        result = await mcFetch("/subscriber/removeTagByName", apiKey, "POST", {
          subscriber_id: bodyData.subscriber_id,
          tag_name: bodyData.tag_name,
        });
        break;

      case "create_tag":
        result = await mcFetch("/page/createTag", apiKey, "POST", {
          name: bodyData.name,
        });
        break;

      // ═══════════════════════════════════════════
      // CUSTOM FIELDS
      // ═══════════════════════════════════════════
      case "set_custom_field":
        result = await mcFetch(
          "/subscriber/setCustomFieldByName",
          apiKey,
          "POST",
          {
            subscriber_id: bodyData.subscriber_id,
            field_name: bodyData.field_name,
            field_value: bodyData.field_value,
          }
        );
        break;

      // ═══════════════════════════════════════════
      // SENDING MESSAGES
      // ═══════════════════════════════════════════
      case "send_content":
        // Send a text message or content block to a subscriber
        result = await mcFetch("/sending/sendContent", apiKey, "POST", {
          subscriber_id: bodyData.subscriber_id,
          data: bodyData.data, // content object — see ManyChat API docs
          message_tag: bodyData.message_tag || "ACCOUNT_UPDATE",
        });
        break;

      case "send_text":
        // Convenience: send a plain text message via Instagram
        result = await mcFetch("/sending/sendContent", apiKey, "POST", {
          subscriber_id: bodyData.subscriber_id,
          data: {
            version: "v2",
            content: {
              type: "instagram",
              messages: [
                {
                  type: "text",
                  text: bodyData.text,
                },
              ],
            },
          },
          message_tag: bodyData.message_tag || "HUMAN_AGENT",
        });
        break;

      // ═══════════════════════════════════════════
      // TRIGGER FLOWS
      // ═══════════════════════════════════════════
      case "send_flow":
        result = await mcFetch("/sending/sendFlow", apiKey, "POST", {
          subscriber_id: bodyData.subscriber_id,
          flow_ns: bodyData.flow_ns,
        });
        break;

      // ═══════════════════════════════════════════
      // CREATE / UPDATE SUBSCRIBER
      // ═══════════════════════════════════════════
      case "create_subscriber":
        result = await mcFetch("/subscriber/createSubscriber", apiKey, "POST", bodyData);
        break;

      case "update_subscriber":
        result = await mcFetch("/subscriber/updateSubscriber", apiKey, "POST", bodyData);
        break;

      default:
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({
            error: `Unknown action: ${action}`,
            available: [
              "page_info", "get_tags", "get_flows", "get_custom_fields",
              "subscriber_info", "find_by_name", "find_by_system_field", "find_by_custom_field",
              "add_tag", "remove_tag", "create_tag", "set_custom_field",
              "send_content", "send_text", "send_flow",
              "create_subscriber", "update_subscriber",
            ],
          }),
        };
    }

    return {
      statusCode: result.status,
      headers: CORS,
      body: JSON.stringify(result.data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
