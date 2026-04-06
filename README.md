# LeadFlow — Production Company CRM

Full lead management system for video production companies.

## Features
- **Dashboard** — Pipeline overview with stats
- **Pipeline** — Kanban board (Cold → Contacted → Warm → Proposal → Closed)
- **Meta DMs** — Unified IG + Facebook inbox with AI-powered replies (Claude API)
- **Form Captures** — Ad form submissions with one-click pipeline conversion
- **Call Calendar** — List + week view for booked discovery calls
- **Lead Scraper** — Scan Google Maps, Instagram, LinkedIn, TikTok, Yelp
- **All Leads** — Searchable/filterable table
- **Outreach** — Personalized cold email templates

## Deploy to Netlify

### Option 1: Drag & Drop
1. Run `npm install && npm run build` locally
2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

### Option 2: Git Deploy
1. Push this folder to a GitHub/GitLab repo
2. Connect the repo in Netlify
3. Build settings are auto-detected from `netlify.toml`

### Option 3: Netlify CLI
```bash
npm install -g netlify-cli
npm install
npm run build
netlify deploy --prod --dir=dist
```

## Local Development
```bash
npm install
npm run dev
```

## AI Replies
The Meta DM inbox uses Claude API for AI-powered replies. The API key is handled automatically when deployed on Anthropic's infrastructure. For standalone deployment, you'll need to add your API key.
