// Google Custom Search proxy — finds real profiles on Instagram, TikTok, LinkedIn
// Free: 100 queries/day with Google Custom Search JSON API
// Uses site: operator to scope results to specific platforms

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key, X-CSE-ID",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

// Platform site prefixes for Google search
const SITE_MAP = {
  instagram: "site:instagram.com",
  tiktok: "site:tiktok.com/@",
  linkedin: "site:linkedin.com/in/",
};

// Extract follower count from Google snippet text
function extractFollowers(snippet) {
  if (!snippet) return 0;
  // Match patterns like "120K Followers", "1.2M followers", "45.3k followers"
  const match = snippet.match(/([\d,.]+)\s*([KkMm])?\s*[Ff]ollowers/i);
  if (!match) return 0;
  let num = parseFloat(match[1].replace(/,/g, ""));
  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "K") num = num; // already in K for our format
  else if (suffix === "M") num = num * 1000;
  else num = num / 1000; // raw number, convert to K
  return Math.round(num * 10) / 10;
}

// Extract handle from Instagram/TikTok URL
function extractHandle(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    if (path.length > 0) return "@" + path[path.length - 1];
  } catch {}
  return "";
}

// Parse Instagram results
function parseInstagram(items) {
  return items.map(item => {
    const handle = extractHandle(item.link);
    const title = item.title || "";
    const snippet = item.snippet || "";
    const followers = extractFollowers(snippet);

    // Try to extract name (usually before • or - or | in title)
    let name = title.split(/[•\-|(@]/)[0].trim();
    if (!name || name.toLowerCase().includes("instagram")) name = handle.replace("@", "");

    // Try to detect content type from snippet/title
    let contentType = "brand";
    const lower = (title + " " + snippet).toLowerCase();
    if (lower.match(/musician|artist|singer|rapper|producer|songwriter|hip.?hop|r&b|pop|rock|indie|rap/)) contentType = "musician";
    else if (lower.match(/restaurant|chef|food|kitchen|cafe|bakery|bar|grill|taco|pizza|sushi/)) contentType = "restaurant";
    else if (lower.match(/vintage|thrift|retro|antique|secondhand/)) contentType = "vintage_store";

    // Try to extract genre for musicians
    let genre = "";
    if (contentType === "musician") {
      const genreMatch = lower.match(/(hip.?hop|r&b|pop|rock|indie|rap|trap|drill|soul|jazz|electronic|afrobeats|reggaeton|country|latin)/i);
      if (genreMatch) genre = genreMatch[1].replace(/hip.?hop/i, "Hip-hop").replace(/r&b/i, "R&B");
    }

    // Determine category
    let category = "commercial";
    if (contentType === "musician") category = "music_video";
    else if (contentType === "restaurant") category = "retainer_restaurant";
    else if (contentType === "vintage_store") category = "retainer_vintage";

    // Detect verified from snippet (Instagram shows "Verified" in some snippets)
    const verified = lower.includes("verified");

    return {
      name,
      handle,
      followers,
      genre,
      contentType,
      verified,
      hasEmail: false, // Can't determine from search
      engagement: followers > 100 ? "high" : followers > 25 ? "medium" : "low",
      area: "", // Hard to determine from search
      category,
      email: "",
      profileUrl: item.link,
      snippet: snippet.substring(0, 200),
      _source: "google_custom_search",
    };
  });
}

// Parse TikTok results
function parseTikTok(items) {
  return items.map(item => {
    const handle = extractHandle(item.link);
    const title = item.title || "";
    const snippet = item.snippet || "";
    const followers = extractFollowers(snippet);

    let name = title.split(/[•\-|(@]/)[0].trim();
    if (!name || name.toLowerCase().includes("tiktok")) name = handle.replace("@", "");

    let contentType = "brand";
    const lower = (title + " " + snippet).toLowerCase();
    if (lower.match(/musician|artist|singer|rapper|producer|songwriter|hip.?hop|r&b|pop|rock|rap/)) contentType = "musician";
    else if (lower.match(/restaurant|chef|food|kitchen|cafe|bakery/)) contentType = "restaurant";
    else if (lower.match(/vintage|thrift|retro|antique/)) contentType = "vintage_store";

    let genre = "";
    if (contentType === "musician") {
      const genreMatch = lower.match(/(hip.?hop|r&b|pop|rock|indie|rap|trap|drill|soul|electronic|afrobeats)/i);
      if (genreMatch) genre = genreMatch[1];
    }

    let category = "commercial";
    if (contentType === "musician") category = "music_video";
    else if (contentType === "restaurant") category = "retainer_restaurant";
    else if (contentType === "vintage_store") category = "retainer_vintage";

    // Extract avg views from snippet
    let avgViews = 0;
    const viewMatch = snippet.match(/([\d,.]+)\s*([KkMm])?\s*(views|likes)/i);
    if (viewMatch) {
      avgViews = parseFloat(viewMatch[1].replace(/,/g, ""));
      if ((viewMatch[2] || "").toUpperCase() === "M") avgViews *= 1000;
    }

    return {
      name,
      handle,
      followers,
      genre,
      contentType,
      verified: lower.includes("verified"),
      avgViews,
      area: "",
      category,
      email: "",
      profileUrl: item.link,
      snippet: snippet.substring(0, 200),
      _source: "google_custom_search",
    };
  });
}

// Parse LinkedIn results
function parseLinkedIn(items) {
  return items.map(item => {
    const title = item.title || "";
    const snippet = item.snippet || "";

    // LinkedIn titles are usually "Name - Role - Company | LinkedIn"
    const titleParts = title.split(/\s*[-–|]\s*/);
    const name = titleParts[0]?.trim() || "Unknown";
    const role = titleParts[1]?.trim() || "";
    const company = (titleParts[2] || "").replace(/\s*\|?\s*LinkedIn\s*/i, "").trim();

    // Try to determine industry from snippet
    let industry = "";
    const lower = (title + " " + snippet).toLowerCase();
    if (lower.match(/restaurant|food|hospitality|chef|kitchen/)) industry = "Restaurant";
    else if (lower.match(/music|entertainment|record|label|artist/)) industry = "Music & Entertainment";
    else if (lower.match(/retail|store|fashion|clothing|vintage/)) industry = "Retail";
    else if (lower.match(/beverage|drink|brew|spirits|wine/)) industry = "Beverage";
    else if (lower.match(/fitness|gym|health|wellness/)) industry = "Fitness";
    else if (lower.match(/beauty|cosmetic|skincare|makeup/)) industry = "Beauty & Cosmetics";
    else if (lower.match(/tech|software|saas|digital/)) industry = "Technology";
    else if (lower.match(/market|advertis|media|creative|agency/)) industry = "Marketing & Advertising";

    // Determine seniority
    let seniority = "manager";
    const roleLower = role.toLowerCase();
    if (roleLower.match(/ceo|cto|cfo|coo|founder|owner|co-founder|president/)) seniority = "c_suite";
    else if (roleLower.match(/\bvp\b|vice president/)) seniority = "vp";
    else if (roleLower.match(/director|head of/)) seniority = "director";

    let category = "commercial";
    if (industry === "Music & Entertainment") category = "music_video";
    else if (industry === "Restaurant") category = "retainer_restaurant";
    else if (industry === "Retail") category = "retainer_vintage";

    return {
      name,
      role,
      seniority,
      company,
      companySize: "", // Can't determine from search
      industry,
      category,
      email: "",
      profileUrl: item.link,
      snippet: snippet.substring(0, 200),
      _source: "google_custom_search",
    };
  });
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const apiKey = event.headers["x-api-key"] || "";
  const cseId = event.headers["x-cse-id"] || "";
  if (!apiKey || !cseId) {
    return {
      statusCode: 401,
      headers: CORS,
      body: JSON.stringify({ error: "Missing Google API key or Custom Search Engine ID" }),
    };
  }

  const params = event.queryStringParameters || {};
  const platform = params.platform || "instagram"; // instagram, tiktok, linkedin
  const query = params.query || "";
  const num = Math.min(parseInt(params.num) || 10, 10); // Max 10 per Google CSE request

  if (!query) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Missing 'query' parameter. Example: musicians in Los Angeles" }),
    };
  }

  const sitePrefix = SITE_MAP[platform] || "";
  const fullQuery = `${sitePrefix} ${query}`;

  try {
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: cseId,
      q: fullQuery,
      num: String(num),
    });

    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${searchParams}`);
    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: CORS,
        body: JSON.stringify({ error: data.error?.message || "Google CSE error", raw: data }),
      };
    }

    const items = data.items || [];
    let results;

    switch (platform) {
      case "instagram":
        results = parseInstagram(items);
        break;
      case "tiktok":
        results = parseTikTok(items);
        break;
      case "linkedin":
        results = parseLinkedIn(items);
        break;
      default:
        results = items.map(i => ({ name: i.title, url: i.link, snippet: i.snippet }));
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        results,
        count: results.length,
        searchInfo: {
          totalResults: data.searchInformation?.totalResults,
          searchTime: data.searchInformation?.searchTime,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
