// Google Places API proxy — searches for businesses near a location
// Uses Google Places Text Search API (free $200/mo credit)

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
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Missing Google API key" }) };
  }

  const params = event.queryStringParameters || {};
  const query = params.query || "restaurants in Los Angeles";
  const type = params.type || ""; // restaurant, store, etc.
  const minRating = parseFloat(params.minRating) || 0;
  const maxResults = Math.min(parseInt(params.maxResults) || 20, 20);

  try {
    // Use Places API Text Search (New)
    const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
    const searchBody = {
      textQuery: query,
      maxResultCount: maxResults,
      languageCode: "en",
    };

    const searchRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.websiteUri,places.nationalPhoneNumber,places.priceLevel,places.businessStatus,places.googleMapsUri",
      },
      body: JSON.stringify(searchBody),
    });

    const data = await searchRes.json();

    if (!searchRes.ok) {
      return {
        statusCode: searchRes.status,
        headers: CORS,
        body: JSON.stringify({ error: data.error?.message || "Google Places API error", raw: data }),
      };
    }

    // Transform to LeadFlow format
    const results = (data.places || [])
      .filter(p => !minRating || (p.rating || 0) >= minRating)
      .map(p => {
        const name = p.displayName?.text || "Unknown";
        const address = p.formattedAddress || "";
        const area = address.split(",").slice(-3, -2)[0]?.trim() || address.split(",")[1]?.trim() || "";
        const types = p.types || [];

        // Determine business type
        let bizType = "other";
        if (types.some(t => ["restaurant", "food", "cafe", "bakery", "bar", "meal_delivery", "meal_takeaway"].includes(t))) bizType = "restaurant";
        else if (types.some(t => ["store", "clothing_store", "shopping_mall", "home_goods_store", "furniture_store"].includes(t))) bizType = "retail";

        // Determine category for LeadFlow
        let category = "retainer_other";
        if (bizType === "restaurant") category = "retainer_restaurant";
        else if (bizType === "retail") category = "retainer_vintage";

        // Price level mapping
        let priceLevel = 0;
        if (p.priceLevel === "PRICE_LEVEL_INEXPENSIVE") priceLevel = 1;
        else if (p.priceLevel === "PRICE_LEVEL_MODERATE") priceLevel = 2;
        else if (p.priceLevel === "PRICE_LEVEL_EXPENSIVE") priceLevel = 3;
        else if (p.priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE") priceLevel = 4;

        return {
          name,
          type: types[0]?.replace(/_/g, " ") || "Business",
          bizType,
          rating: p.rating || 0,
          reviews: p.userRatingCount || 0,
          area,
          priceLevel,
          hasSocial: false, // Can't determine from Places API alone
          hasWebsite: !!p.websiteUri,
          category,
          email: "", // Not available from Places API
          phone: p.nationalPhoneNumber || "",
          website: p.websiteUri || "",
          address,
          mapsUrl: p.googleMapsUri || "",
          _source: "google_places_api",
        };
      });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ results, count: results.length }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
