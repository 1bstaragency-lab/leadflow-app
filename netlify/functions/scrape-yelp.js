// Yelp Fusion API proxy — searches for businesses
// Free: 500 API calls/day

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const apiKey = event.headers["x-api-key"] || "";
  if (!apiKey) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Missing Yelp API key" }) };
  }

  const params = event.queryStringParameters || {};
  const term = params.term || "restaurants";
  const location = params.location || "Los Angeles, CA";
  const limit = Math.min(parseInt(params.limit) || 20, 50);
  const sortBy = params.sort_by || "best_match"; // best_match, rating, review_count, distance
  const price = params.price || ""; // 1,2,3,4 (comma-separated)
  const categories = params.categories || ""; // e.g. "restaurants,vintage"

  try {
    const searchParams = new URLSearchParams({
      term,
      location,
      limit: String(limit),
      sort_by: sortBy,
    });
    if (price) searchParams.append("price", price);
    if (categories) searchParams.append("categories", categories);

    const res = await fetch(`https://api.yelp.com/v3/businesses/search?${searchParams}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: CORS,
        body: JSON.stringify({ error: data.error?.description || "Yelp API error", raw: data }),
      };
    }

    // Transform to LeadFlow format
    const results = (data.businesses || []).map(biz => {
      const cats = (biz.categories || []).map(c => c.alias);
      const catTitles = (biz.categories || []).map(c => c.title);

      // Determine business type
      let bizType = "other";
      if (cats.some(c => ["restaurants", "food", "cafes", "bakeries", "bars", "breakfast_brunch", "coffee", "delis", "desserts", "juicebars", "pizza", "seafood", "sushi", "thai", "mexican", "italian", "chinese", "japanese", "korean", "vietnamese", "indian", "mediterranean", "greek", "french", "american"].includes(c))) {
        bizType = "restaurant";
      } else if (cats.some(c => ["shopping", "vintage", "thrift_stores", "fashion", "clothingstore", "accessories", "antiques", "fleamarkets", "usedbooks"].includes(c))) {
        bizType = "retail";
      }

      let category = "retainer_other";
      if (bizType === "restaurant") category = "retainer_restaurant";
      else if (bizType === "retail") category = "retainer_vintage";

      const area = biz.location?.city || "";

      return {
        name: biz.name,
        type: catTitles[0] || "Business",
        bizType,
        rating: biz.rating || 0,
        reviews: biz.review_count || 0,
        area,
        priceLevel: (biz.price || "").length, // "$" = 1, "$$" = 2, etc.
        claimed: !biz.is_closed, // Yelp doesn't expose claimed directly in search; use is_closed as proxy
        category,
        email: "", // Not available from Yelp search API
        phone: biz.display_phone || "",
        website: biz.url || "",
        address: (biz.location?.display_address || []).join(", "),
        yelpUrl: biz.url || "",
        imageUrl: biz.image_url || "",
        _source: "yelp_fusion_api",
      };
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ results, count: results.length, total: data.total }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
