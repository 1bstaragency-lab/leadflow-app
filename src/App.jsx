import { useState, useEffect, useRef } from "react";

const FONT = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&display=swap";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const STAGES=["cold","contacted","warm","proposal","closed"];
const SL={cold:"Cold",contacted:"Contacted",warm:"Warm",proposal:"Proposal",closed:"Closed"};
const SC={cold:"#6B7280",contacted:"#3B82F6",warm:"#F59E0B",proposal:"#8B5CF6",closed:"#10B981"};
const SOURCES=["google_maps","instagram","linkedin","tiktok","yelp","referral","ig_dm","fb_dm","form_capture","manual"];
const SRC_L={google_maps:"Google Maps",instagram:"Instagram",linkedin:"LinkedIn",tiktok:"TikTok",yelp:"Yelp",referral:"Referral",ig_dm:"IG DM",fb_dm:"FB DM",form_capture:"Ad Form",manual:"Manual"};
const CATS=["music_video","commercial","retainer_restaurant","retainer_vintage","retainer_other"];
const CL={music_video:"Music Video",commercial:"Commercial",retainer_restaurant:"Restaurant Retainer",retainer_vintage:"Vintage Retainer",retainer_other:"Other Retainer"};
const CL_SHORT={music_video:"Music Video",commercial:"Commercial",retainer_restaurant:"Restaurant",retainer_vintage:"Vintage",retainer_other:"Retainer"};

const TAGS={
  music_video:{label:"Music Video",color:"#E040FB",bg:"rgba(224,64,251,0.12)"},
  commercial:{label:"Commercial",color:"#FF6D00",bg:"rgba(255,109,0,0.12)"},
  restaurant:{label:"Restaurant",color:"#00E676",bg:"rgba(0,230,118,0.12)"},
  vintage:{label:"Vintage",color:"#FFD740",bg:"rgba(255,215,64,0.12)"},
  retainer:{label:"Retainer",color:"#40C4FF",bg:"rgba(64,196,255,0.12)"},
  hot:{label:"Hot Lead",color:"#FF1744",bg:"rgba(255,23,68,0.12)"},
  booked:{label:"Call Booked",color:"#69F0AE",bg:"rgba(105,240,174,0.12)"},
};

const CALL_TYPES={
  discovery:{label:"Discovery Call",color:"#40C4FF",icon:"📞"},
  creative_brief:{label:"Creative Brief",color:"#E040FB",icon:"🎨"},
  follow_up:{label:"Follow-up",color:"#FFD740",icon:"🔄"},
  shoot_planning:{label:"Shoot Planning",color:"#69F0AE",icon:"🎬"},
};
const SRC_ICO={ig_dm:"📸",fb_dm:"📘",form_capture:"📋",manual:"✏️",referral:"🤝"};

const AI_SYS=`You are the AI DM assistant for a video production company specializing in music videos, commercials, and monthly content retainers for small businesses (restaurants, vintage stores, etc).

You reply to Instagram and Facebook DMs from potential clients who found us through Meta ads. Be conversational, warm, knowledgeable. Never pushy.

Services & pricing:
- Music videos: $3K-15K+. Concept to color grade.
- Commercials: $5K-20K+. 15s/30s/60s. Creative direction, production, post.
- Monthly retainers restaurants: $1,500/mo+. 2 shoot days/month, weekly content.
- Monthly retainers vintage stores: $1,500/mo+. New arrivals, styling reels, walkthroughs.
- General retainers: $1,500/mo+. Customized.

Rules:
- Concise (2-4 short paragraphs max)
- Friendly professional tone
- Ask qualifying questions: budget, timeline, needs
- Offer examples or quick call
- Give ranges not exact quotes
- Light emoji (1-2 max)
- Never make up portfolio links
- If ready to book, suggest call with time slots`;

const OUTREACH={
  music_video:{subject:"Bringing your sound to life — video production",body:"Hey {{name}},\n\nI came across your work and love what you're building sonically. I run a production company specializing in music videos that actually match the energy of the music — no cookie-cutter shoots.\n\nWould love to chat about bringing your next visual to life. We handle everything from concept to color grade.\n\nDown to hop on a quick call this week?\n\nBest,\n[Your Name]"},
  commercial:{subject:"Video that converts — production partner for {{company}}",body:"Hi {{name}},\n\nI noticed {{company}} is doing great things. We create commercials designed to stop the scroll and drive real results.\n\nOur recent campaigns delivered 3-5x ROAS for brands in your vertical. I'd love to show you what we could do for {{company}}.\n\nWould a 15-minute intro call work this week?\n\nBest,\n[Your Name]"},
  retainer_restaurant:{subject:"Making {{company}} look as good as the food tastes",body:"Hey {{name}},\n\nThe vibe at {{company}} is incredible. It deserves content that matches.\n\nWe offer monthly retainer packages for restaurants: social content shoots, menu videos, BTS stories, seasonal campaigns. Everything to keep your feed fresh.\n\nPackages start at $1,500/mo. Want to see examples?\n\nCheers,\n[Your Name]"},
  retainer_vintage:{subject:"Content that sells — monthly production for {{company}}",body:"Hi {{name}},\n\nLove what you've curated at {{company}}. Vintage stores with strong visual identity are crushing it on social right now.\n\nWe do monthly retainer shoots: new arrivals videos, styling reels, store walkthroughs, campaign content. Everything to match your brand's aesthetic.\n\nWould love to chat about a partnership.\n\nBest,\n[Your Name]"},
  retainer_other:{subject:"Monthly video content for {{company}}",body:"Hi {{name}},\n\nI've been following {{company}} and think there's a huge opportunity to level up your content. We offer monthly retainer packages — social clips, brand stories, product showcases, and more.\n\nNo per-project headaches. Consistent, high-quality content on schedule.\n\nCan I send over our retainer deck?\n\nBest,\n[Your Name]"},
};

// ═══ SAMPLE DATA ════════════════════════════════════════════════════════
const INIT_LEADS=[
  {id:1,name:"Marcus Allen",company:"Independent Artist",email:"marcus@email.com",phone:"555-0101",source:"instagram",category:"music_video",stage:"cold",notes:"R&B artist, 45K followers, dropping album Q3",lastContact:null,created:"2026-03-28"},
  {id:2,name:"Sofia Reyes",company:"Velvet Luxe Boutique",email:"sofia@velvetluxe.com",phone:"555-0102",source:"google_maps",category:"retainer_vintage",stage:"contacted",notes:"High-end vintage in Arts District",lastContact:"2026-04-01",created:"2026-03-15"},
  {id:3,name:"James Chen",company:"Fuego Kitchen & Bar",email:"james@fuegokb.com",phone:"555-0103",source:"yelp",category:"retainer_restaurant",stage:"warm",notes:"Asian fusion, wants social content ASAP",lastContact:"2026-04-03",created:"2026-03-10"},
  {id:4,name:"Ayesha Williams",company:"NovaBright Skincare",email:"ayesha@novabright.com",phone:"555-0104",source:"linkedin",category:"commercial",stage:"proposal",notes:"DTC brand, $15K budget for launch commercial",lastContact:"2026-04-04",created:"2026-03-01"},
  {id:5,name:"Derek Thompson",company:"Thompson Records",email:"derek@thompsonrec.com",phone:"555-0105",source:"referral",category:"music_video",stage:"closed",notes:"Label deal — 3 music videos, signed $24K",lastContact:"2026-04-02",created:"2026-02-20"},
  {id:6,name:"Luna Martinez",company:"Casa Oaxaca",email:"luna@casaoaxaca.com",phone:"555-0106",source:"google_maps",category:"retainer_restaurant",stage:"cold",notes:"Authentic Mexican, incredible interior, no social presence",lastContact:null,created:"2026-04-01"},
  {id:7,name:"Tyler Brooks",company:"Retro Revival Co",email:"tyler@retrorevival.com",phone:"555-0107",source:"tiktok",category:"retainer_vintage",stage:"contacted",notes:"Viral TikTok store, 200K followers",lastContact:"2026-04-03",created:"2026-03-25"},
  {id:8,name:"Priya Sharma",company:"Bloom Fitness",email:"priya@bloomfit.com",phone:"555-0108",source:"instagram",category:"retainer_other",stage:"cold",notes:"Boutique gym, monthly class promo videos",lastContact:null,created:"2026-04-04"},
];

const INIT_THREADS=[
  {id:"t1",platform:"ig",handle:"@cheframirez_",name:"Chef Ramirez",avatar:"👨‍🍳",adSource:"Restaurant Retainer Ad",tags:["restaurant","hot"],unread:true,starred:true,lastActive:"2 min ago",status:"awaiting_reply",messages:[{from:"them",text:"Hey! I saw your ad about monthly content for restaurants. We just opened in Silver Lake and our social is dead lol",ts:"2:41 PM"},{from:"them",text:"What does the retainer include?",ts:"2:41 PM"}]},
  {id:"t2",platform:"ig",handle:"@lilnova.music",name:"Lil Nova",avatar:"🎤",adSource:"Music Video Ad",tags:["music_video"],unread:true,starred:false,lastActive:"18 min ago",status:"awaiting_reply",messages:[{from:"them",text:"yooo i need a video for my next single dropping in june. saw your reel with that transition — crazy",ts:"2:25 PM"},{from:"them",text:"what's your rate for a full music video?",ts:"2:26 PM"}]},
  {id:"t3",platform:"fb",handle:"Vintage Haus",name:"Vintage Haus",avatar:"🏪",adSource:"DM Ad — Vintage Stores",tags:["vintage","booked"],unread:false,starred:true,lastActive:"1 hr ago",status:"call_booked",messages:[{from:"them",text:"Hi! Vintage furniture store in Echo Park. Your ad mentioned monthly content — do you do photography too or just video?",ts:"1:15 PM"},{from:"ai",text:"Hey! Thanks for reaching out 🙌 We focus on video — new arrivals walkthroughs, styling reels, BTS, seasonal campaigns. Every shoot includes high-res stills from footage too.\n\nRetainers start at $1,500/mo with 2 shoot days + weekly content.\n\nWant me to send examples?",ts:"1:22 PM"},{from:"them",text:"that sounds perfect. yes please!",ts:"1:35 PM"},{from:"me",text:"Sent examples to your email! Want to hop on a call Thursday or Friday to map out a content plan?",ts:"1:50 PM"},{from:"them",text:"Thursday at 2pm works!",ts:"2:01 PM"},{from:"me",text:"Locked in! ✅ Calendar invite coming. Talk Thursday!",ts:"2:05 PM"}]},
  {id:"t4",platform:"fb",handle:"Fizzy Beverages",name:"Fizzy Beverages",avatar:"🥤",adSource:"Commercial Services Ad",tags:["commercial","booked"],unread:false,starred:false,lastActive:"3 hr ago",status:"call_booked",messages:[{from:"them",text:"hey we filled out your form about a commercial for our sparkling water line",ts:"11:02 AM"},{from:"ai",text:"Hey! Saw that come through — love the Fizzy brand. 30-second commercial sounds great.\n\nEstimate $8-12K range depending on locations/talent. Includes concept, full production day, post with color grade + sound.\n\nWant to hop on a 15-min call? Thursday or Friday afternoon?",ts:"11:15 AM"},{from:"them",text:"Thursday 3pm?",ts:"11:30 AM"},{from:"ai",text:"Thursday 3pm locked in ✅ Sending calendar invite!",ts:"11:32 AM"}]},
  {id:"t5",platform:"ig",handle:"@terra.eats",name:"Terra Eats",avatar:"🥗",adSource:"Restaurant Retainer Ad",tags:["restaurant"],unread:false,starred:false,lastActive:"5 hr ago",status:"replied",messages:[{from:"them",text:"Hi! Plant-based restaurant in DTLA. Looking for social media content — mainly reels and stories",ts:"9:30 AM"},{from:"ai",text:"Hey! Plant-based restaurants photograph SO well 🌱 Monthly retainers: $1,500/mo, 2 shoot days, weekly reels & stories, menu features, BTS.\n\nWant to see examples from similar spots?",ts:"9:45 AM"}]},
  {id:"t6",platform:"ig",handle:"@melodykane",name:"Melody Kane",avatar:"🎵",adSource:"Music Video Ad",tags:["music_video","hot"],unread:true,starred:false,lastActive:"25 min ago",status:"awaiting_reply",messages:[{from:"them",text:"hiii independent artist looking for a video for my debut single. budget around $5K. is that enough for something cinematic?",ts:"2:18 PM"}]},
];

const INIT_FORMS=[
  {id:"fc1",name:"Sarah Kim",email:"sarah@bloomtea.com",company:"Bloom Tea Co",phone:"555-0201",service:"Commercial",budget:"$5K-10K",message:"Need a 30s ad for our new matcha line launching July.",adName:"Commercial Services Ad",submitted:"Apr 5, 10:30 AM",status:"new"},
  {id:"fc2",name:"Marcus Rivera",email:"marcus@riveraphotography.com",company:"Rivera Creative",phone:"555-0202",service:"Music Video",budget:"$3K-5K",message:"I manage 3 artists and need consistent music video production. 1-2 videos a month.",adName:"Music Video Ad",submitted:"Apr 5, 9:15 AM",status:"new"},
  {id:"fc3",name:"Jenny Tran",email:"jenny@phoreal.com",company:"Pho Real Restaurant",phone:"555-0203",service:"Monthly Retainer",budget:"$1.5K-2K/mo",message:"Opened 6 months ago, need help with social — food videos and BTS.",adName:"Restaurant Retainer Ad",submitted:"Apr 4, 4:45 PM",status:"contacted"},
  {id:"fc4",name:"Alex Dunn",email:"alex@dustyvintage.com",company:"Dusty Vintage",phone:"555-0204",service:"Monthly Retainer",budget:"Under $1.5K/mo",message:"Small vintage shop, want styled reels and TikTok content.",adName:"DM Ad — Vintage Stores",submitted:"Apr 4, 2:20 PM",status:"converted"},
];

const INIT_FLOWS=[
  {id:"f1",name:"Music Video Inquiry",active:true,platform:"both",keywords:["music video","video shoot","mv","visual"],steps:[{type:"reply",text:"Hey! 🎬 Thanks for reaching out about music video production.\n\nQuick q — what genre and rough timeline?"},{type:"wait"},{type:"reply",text:"We handle concept to color grade. Packages $3K-$15K depending on scope.\n\nWant our portfolio + breakdown?"},{type:"tag",tag:"music_video"}],stats:{triggered:47,replied:42,converted:12}},
  {id:"f2",name:"Restaurant Retainer",active:true,platform:"ig",keywords:["restaurant","food content","menu","food video"],steps:[{type:"reply",text:"Hey! Thanks for your interest! 🍽️ We make food look as good on camera as it tastes.\n\nOne-time shoot or ongoing monthly content?"},{type:"wait"},{type:"reply",text:"Monthly retainers from $1,500/mo:\n✓ 2 shoot days\n✓ Weekly reels & stories\n✓ Menu features + BTS\n\nWant examples?"},{type:"tag",tag:"restaurant"}],stats:{triggered:31,replied:28,converted:8}},
  {id:"f3",name:"Vintage Store Content",active:true,platform:"both",keywords:["vintage","thrift","retro","secondhand"],steps:[{type:"reply",text:"Hey! 🔥 Vintage stores with consistent content are crushing it.\n\nWe do monthly packages — arrivals videos, styling reels, walkthroughs.\n\nIG, TikTok, or both?"},{type:"wait"},{type:"reply",text:"Packages from $1,500/mo, shot and edited to your aesthetic.\n\nWant examples?"},{type:"tag",tag:"vintage"}],stats:{triggered:22,replied:19,converted:5}},
  {id:"f4",name:"Commercial / Brand",active:true,platform:"fb",keywords:["commercial","ad video","brand video","promo"],steps:[{type:"reply",text:"Hey! 📹 We create scroll-stopping ads that convert — 15s, 30s, 60s.\n\nWhat product or service are you promoting?"},{type:"wait"},{type:"reply",text:"Commercial packages $5K-$20K+. Recent campaigns delivered 3-5x ROAS.\n\nWant a 15-min call this week?"},{type:"tag",tag:"commercial"}],stats:{triggered:18,replied:16,converted:6}},
  {id:"f5",name:"Pricing / Booking",active:true,platform:"both",keywords:["pricing","rates","cost","how much","book","availability"],steps:[{type:"reply",text:"Hey! 🙌 Rates by project type:\n\n🎬 Music Videos: $3K-$15K+\n📺 Commercials: $5K-$20K+\n📱 Monthly Retainers: from $1,500/mo\n\nWhat type of project?"},{type:"wait"},{type:"reply",text:"Want a quick discovery call? I can walk you through packages.\n\nI have openings this week — what day works?"},{type:"tag",tag:"hot"}],stats:{triggered:63,replied:55,converted:18}},
];

const INIT_BOOKINGS=[
  {id:"b1",title:"Discovery — Vintage Haus",date:new Date(2026,3,9,14,0),duration:30,type:"discovery",source:"ig_dm",contact:"Vintage Haus",email:"hello@vintagehaus.com",phone:"555-0301",category:"vintage",notes:"Vintage furniture, Echo Park. $1,500/mo retainer interest.",status:"confirmed",threadId:"t3"},
  {id:"b2",title:"Creative Brief — Fizzy Beverages",date:new Date(2026,3,9,15,0),duration:15,type:"creative_brief",source:"fb_dm",contact:"Fizzy Beverages",email:"brand@fizzy.com",phone:"555-0302",category:"commercial",notes:"30s commercial, sparkling water. $8-12K range.",status:"confirmed",threadId:"t4"},
  {id:"b3",title:"Discovery — Marcus Rivera",date:new Date(2026,3,7,11,0),duration:30,type:"discovery",source:"form_capture",contact:"Marcus Rivera",email:"marcus@riveraphotography.com",phone:"555-0202",category:"music_video",notes:"Manages 3 artists. 1-2 videos/month. $3-5K/video.",status:"confirmed"},
  {id:"b4",title:"Follow-up — Bloom Fitness",date:new Date(2026,3,8,10,0),duration:20,type:"follow_up",source:"manual",contact:"Priya Sharma",email:"priya@bloomfit.com",phone:"555-0108",category:"retainer",notes:"Boutique gym. Monthly promo videos. Sent deck last week.",status:"confirmed"},
  {id:"b5",title:"Discovery — Sarah Kim",date:new Date(2026,3,10,13,0),duration:30,type:"discovery",source:"form_capture",contact:"Sarah Kim",email:"sarah@bloomtea.com",phone:"555-0201",category:"commercial",notes:"Bloom Tea. 30s matcha ad. $5-10K budget.",status:"pending"},
  {id:"b6",title:"Shoot Planning — Thompson Records",date:new Date(2026,3,7,14,0),duration:45,type:"shoot_planning",source:"referral",contact:"Derek Thompson",email:"derek@thompsonrec.com",phone:"555-0105",category:"music_video",notes:"First of 3 music videos. $24K total.",status:"confirmed"},
  {id:"b7",title:"Discovery — Melody Kane",date:new Date(2026,3,11,16,0),duration:30,type:"discovery",source:"ig_dm",contact:"Melody Kane",email:"",phone:"",category:"music_video",notes:"Debut single. ~$5K budget. Cinematic.",status:"pending",threadId:"t6"},
  {id:"b8",title:"Follow-up — Casa Oaxaca",date:new Date(2026,3,6,11,30),duration:30,type:"follow_up",source:"manual",contact:"Luna Martinez",email:"luna@casaoaxaca.com",phone:"555-0106",category:"restaurant",notes:"Follow up on retainer proposal.",status:"confirmed"},
];

// ═══ EXPANDED SCRAPE DATA — rich fields per platform for deep filtering ═══
const SCRAPE_DB={
  google_maps:[
    {name:"Golden Hour Café",type:"Coffee shop",bizType:"restaurant",rating:4.7,reviews:312,area:"Downtown",priceLevel:2,hasSocial:false,hasWebsite:true,category:"retainer_restaurant",email:"hello@goldenhour.com"},
    {name:"Midnight Vinyl",type:"Record shop",bizType:"retail",rating:4.5,reviews:87,area:"Arts District",priceLevel:2,hasSocial:true,hasWebsite:true,category:"retainer_vintage",email:"info@midnightvinyl.com"},
    {name:"Sakura Ramen",type:"Japanese",bizType:"restaurant",rating:4.8,reviews:540,area:"Midtown",priceLevel:2,hasSocial:true,hasWebsite:true,category:"retainer_restaurant",email:"contact@sakuraramen.com"},
    {name:"Casa Luna",type:"Mexican",bizType:"restaurant",rating:4.3,reviews:198,area:"Silver Lake",priceLevel:1,hasSocial:false,hasWebsite:false,category:"retainer_restaurant",email:"info@casaluna.la"},
    {name:"Epoch Vintage",type:"Vintage clothing",bizType:"retail",rating:4.6,reviews:64,area:"Echo Park",priceLevel:2,hasSocial:true,hasWebsite:true,category:"retainer_vintage",email:"hey@epochvintage.com"},
    {name:"Nori Bowl",type:"Poke & bowls",bizType:"restaurant",rating:4.1,reviews:156,area:"Santa Monica",priceLevel:1,hasSocial:false,hasWebsite:true,category:"retainer_restaurant",email:"hello@noribowl.com"},
    {name:"The Painted Door",type:"Gallery & café",bizType:"other",rating:4.9,reviews:73,area:"Arts District",priceLevel:3,hasSocial:true,hasWebsite:true,category:"retainer_other",email:"info@painteddoor.la"},
    {name:"Vinyl & Threads",type:"Vintage + records",bizType:"retail",rating:3.8,reviews:42,area:"Highland Park",priceLevel:1,hasSocial:false,hasWebsite:false,category:"retainer_vintage",email:"shop@vinylthreads.com"},
    {name:"Fuego Street Tacos",type:"Street food",bizType:"restaurant",rating:4.4,reviews:820,area:"Boyle Heights",priceLevel:1,hasSocial:false,hasWebsite:false,category:"retainer_restaurant",email:"fuego@streettacos.com"},
    {name:"Greenhouse Juice",type:"Juice bar",bizType:"restaurant",rating:4.2,reviews:201,area:"Venice",priceLevel:2,hasSocial:true,hasWebsite:true,category:"retainer_other",email:"hi@greenhousejuice.com"},
    {name:"Studio Barbershop",type:"Barbershop",bizType:"other",rating:4.7,reviews:390,area:"Koreatown",priceLevel:2,hasSocial:false,hasWebsite:false,category:"retainer_other",email:"cuts@studiobarbershop.la"},
    {name:"Bodega Rosalia",type:"Wine bar & tapas",bizType:"restaurant",rating:4.5,reviews:125,area:"Los Feliz",priceLevel:3,hasSocial:true,hasWebsite:true,category:"retainer_restaurant",email:"hola@bodegarosalia.com"},
  ],
  instagram:[
    {name:"Jay Monet",handle:"@jaymonet",followers:120,genre:"Hip-hop",contentType:"musician",verified:false,hasEmail:true,engagement:"high",area:"Los Angeles",category:"music_video",email:"mgmt@jaymonet.com"},
    {name:"Vibe Athletics",handle:"@vibeathletics",followers:85,genre:"",contentType:"brand",verified:false,hasEmail:true,engagement:"medium",area:"Los Angeles",category:"commercial",email:"collab@vibeathletics.com"},
    {name:"The Rustic Edit",handle:"@therusticedit",followers:40,genre:"",contentType:"vintage_store",verified:false,hasEmail:true,engagement:"high",area:"Pasadena",category:"retainer_vintage",email:"shop@therusticedit.com"},
    {name:"Melody Kane",handle:"@melodykane",followers:28,genre:"Indie / Pop",contentType:"musician",verified:false,hasEmail:true,engagement:"high",area:"Silver Lake",category:"music_video",email:"mel@melodykane.com"},
    {name:"Raw Denim Co",handle:"@rawdenimco",followers:150,genre:"",contentType:"brand",verified:true,hasEmail:true,engagement:"medium",area:"DTLA",category:"commercial",email:"brand@rawdenim.co"},
    {name:"Chef Dominique",handle:"@chefdominique",followers:62,genre:"",contentType:"restaurant",verified:false,hasEmail:true,engagement:"high",area:"West Hollywood",category:"retainer_restaurant",email:"dom@chefdominique.com"},
    {name:"Luxe Curated",handle:"@luxecurated",followers:95,genre:"",contentType:"vintage_store",verified:false,hasEmail:true,engagement:"medium",area:"Echo Park",category:"retainer_vintage",email:"info@luxecurated.com"},
    {name:"K.Soto Music",handle:"@ksotomusic",followers:210,genre:"R&B / Soul",contentType:"musician",verified:true,hasEmail:true,engagement:"high",area:"Inglewood",category:"music_video",email:"mgmt@ksoto.com"},
    {name:"Bloom Studio",handle:"@bloomstudio",followers:18,genre:"",contentType:"brand",verified:false,hasEmail:true,engagement:"low",area:"Culver City",category:"retainer_other",email:"hello@bloomstudio.co"},
    {name:"Neon Nights",handle:"@neonnightsla",followers:340,genre:"",contentType:"brand",verified:true,hasEmail:true,engagement:"high",area:"Hollywood",category:"commercial",email:"events@neonnights.la"},
    {name:"Lil Draco",handle:"@lildracoworld",followers:55,genre:"Trap / Drill",contentType:"musician",verified:false,hasEmail:false,engagement:"medium",area:"Compton",category:"music_video",email:""},
    {name:"Aria Voss",handle:"@ariavossmusic",followers:430,genre:"Pop / Electronic",contentType:"musician",verified:true,hasEmail:true,engagement:"high",area:"Santa Monica",category:"music_video",email:"team@ariavoss.com"},
    {name:"Slow Pour Coffee",handle:"@slowpourcoffee",followers:12,genre:"",contentType:"restaurant",verified:false,hasEmail:true,engagement:"medium",area:"Eagle Rock",category:"retainer_restaurant",email:"hello@slowpour.co"},
    {name:"D. Marcus",handle:"@dmarcusofficial",followers:8,genre:"Afrobeats",contentType:"musician",verified:false,hasEmail:true,engagement:"low",area:"Inglewood",category:"music_video",email:"dmarcus@email.com"},
  ],
  linkedin:[
    {name:"Rachel Kim",role:"Marketing Dir",seniority:"director",company:"FreshBrew Co",companySize:"51-200",industry:"Beverage",category:"commercial",email:"rachel@freshbrew.co"},
    {name:"Daniel Okafor",role:"CEO",seniority:"c_suite",company:"StreetVault Vintage",companySize:"1-10",industry:"Retail",category:"retainer_vintage",email:"daniel@streetvault.com"},
    {name:"Maria Gonzalez",role:"Owner",seniority:"c_suite",company:"Cantina Sol",companySize:"11-50",industry:"Restaurant",category:"retainer_restaurant",email:"maria@cantinasol.com"},
    {name:"Jason Park",role:"Brand Manager",seniority:"manager",company:"Halo Spirits",companySize:"51-200",industry:"Beverage",category:"commercial",email:"jason@halospirits.com"},
    {name:"Tanya Rivera",role:"Founder",seniority:"c_suite",company:"Nostalgia Threads",companySize:"1-10",industry:"Retail",category:"retainer_vintage",email:"tanya@nostalgiathreads.com"},
    {name:"Chris Adler",role:"VP Marketing",seniority:"vp",company:"Prism Fitness",companySize:"201-500",industry:"Fitness",category:"commercial",email:"chris@prismfit.com"},
    {name:"Layla Hassan",role:"Creative Director",seniority:"director",company:"Oasis Records",companySize:"11-50",industry:"Music & Entertainment",category:"music_video",email:"layla@oasisrecords.com"},
    {name:"Marcus Webb",role:"A&R Manager",seniority:"manager",company:"Sunset Sound Label",companySize:"11-50",industry:"Music & Entertainment",category:"music_video",email:"marcus@sunsetsound.co"},
    {name:"Nina Patel",role:"Head of Content",seniority:"director",company:"Glow Beauty Co",companySize:"51-200",industry:"Beauty & Cosmetics",category:"commercial",email:"nina@glowbeauty.com"},
    {name:"Eric Foster",role:"Owner",seniority:"c_suite",company:"Foster's Vintage Finds",companySize:"1-10",industry:"Retail",category:"retainer_vintage",email:"eric@fostersvintage.com"},
  ],
  tiktok:[
    {name:"Kira Nova",handle:"@kiranova",followers:500,genre:"Pop",contentType:"musician",verified:true,avgViews:85,area:"Los Angeles",category:"music_video",email:"booking@kiranova.com"},
    {name:"Drip Society",handle:"@dripsociety",followers:220,genre:"",contentType:"brand",verified:false,avgViews:45,area:"DTLA",category:"commercial",email:"brand@dripsociety.com"},
    {name:"AJ Flames",handle:"@ajflames",followers:78,genre:"Rap",contentType:"musician",verified:false,avgViews:22,area:"South LA",category:"music_video",email:"aj@ajflames.com"},
    {name:"Faded Goods",handle:"@fadedgoods",followers:145,genre:"",contentType:"vintage_store",verified:false,avgViews:38,area:"Long Beach",category:"retainer_vintage",email:"hi@fadedgoods.com"},
    {name:"Bao House",handle:"@baohousela",followers:52,genre:"",contentType:"restaurant",verified:false,avgViews:15,area:"SGV",category:"retainer_restaurant",email:"eat@baohouse.la"},
    {name:"22Savage",handle:"@22savagetok",followers:310,genre:"Drill",contentType:"musician",verified:false,avgViews:120,area:"Inglewood",category:"music_video",email:"mgmt@22savage.co"},
    {name:"Velvet Rose",handle:"@velvetrosesings",followers:180,genre:"R&B / Neo-soul",contentType:"musician",verified:true,avgViews:60,area:"Pasadena",category:"music_video",email:"booking@velvetrose.la"},
    {name:"Throwback Alley",handle:"@throwbackalley",followers:92,genre:"",contentType:"vintage_store",verified:false,avgViews:28,area:"Venice",category:"retainer_vintage",email:"shop@throwbackalley.com"},
  ],
  yelp:[
    {name:"Ember & Oak",type:"New American",bizType:"restaurant",rating:4.6,reviews:280,area:"West Side",priceLevel:3,claimed:true,category:"retainer_restaurant",email:"events@emberandoak.com"},
    {name:"Thrift & Thread",type:"Vintage",bizType:"retail",rating:4.4,reviews:55,area:"East Village",priceLevel:1,claimed:false,category:"retainer_vintage",email:"hello@thriftthread.com"},
    {name:"Pho District",type:"Vietnamese",bizType:"restaurant",rating:4.7,reviews:620,area:"Chinatown",priceLevel:1,claimed:true,category:"retainer_restaurant",email:"info@phodistrict.la"},
    {name:"Retro Luxe",type:"Vintage boutique",bizType:"retail",rating:4.2,reviews:33,area:"Los Feliz",priceLevel:2,claimed:false,category:"retainer_vintage",email:"shop@retroluxe.com"},
    {name:"Wild Flour Bakery",type:"Bakery & café",bizType:"restaurant",rating:4.8,reviews:410,area:"Culver City",priceLevel:2,claimed:true,category:"retainer_restaurant",email:"bake@wildflour.com"},
    {name:"Good Vibes Taqueria",type:"Mexican",bizType:"restaurant",rating:4.3,reviews:190,area:"Highland Park",priceLevel:1,claimed:false,category:"retainer_restaurant",email:"order@goodvibetacos.com"},
    {name:"Archive Selects",type:"Vintage resale",bizType:"retail",rating:4.1,reviews:27,area:"Silver Lake",priceLevel:2,claimed:true,category:"retainer_vintage",email:"info@archiveselects.com"},
    {name:"Olive & Thyme",type:"Mediterranean",bizType:"restaurant",rating:4.5,reviews:350,area:"Burbank",priceLevel:2,claimed:true,category:"retainer_restaurant",email:"eat@oliveandthyme.la"},
  ],
};

// Format scrape results for display based on source type
const fmtScrapeResult=(src,r)=>{
  if(src==="google_maps"){
    const parts=[r.type,`${r.rating}★ (${r.reviews})`,r.area];
    if(!r.hasSocial)parts.push("No social");
    return{...r,detail:parts.join(" · ")};
  }
  if(src==="instagram"){
    const parts=[r.handle,`${r.followers}K`,r.genre||r.contentType.replace("_"," ")];
    if(r.verified)parts.push("Verified ✓");
    if(r.engagement==="high")parts.push("High engagement");
    return{...r,detail:parts.join(" · ")};
  }
  if(src==="linkedin"){
    return{...r,detail:`${r.role} at ${r.company} · ${r.industry} · ${r.companySize} employees`};
  }
  if(src==="tiktok"){
    const parts=[r.handle,`${r.followers}K followers`,`~${r.avgViews}K avg views`];
    if(r.genre)parts.push(r.genre);
    if(r.verified)parts.push("Verified ✓");
    return{...r,detail:parts.join(" · ")};
  }
  if(src==="yelp"){
    const parts=[r.type,`${r.rating}★ (${r.reviews})`,r.area,"$".repeat(r.priceLevel)];
    if(!r.claimed)parts.push("Unclaimed");
    return{...r,detail:parts.join(" · ")};
  }
  return r;
};

// Source-specific filter definitions — controls what UI shows for each source
const SRC_FILTERS={
  google_maps:{label:"Google Maps",filters:[
    {key:"area",type:"select",label:"Area / Neighborhood",options:["all","Downtown","Arts District","Midtown","Silver Lake","Echo Park","Santa Monica","Highland Park","Boyle Heights","Venice","Koreatown","Los Feliz"],allLabel:"All Areas"},
    {key:"bizType",type:"select",label:"Business Type",options:["all","restaurant","retail","other"],labels:{restaurant:"Restaurant / Food",retail:"Retail / Vintage",other:"Other"},allLabel:"All Types"},
    {key:"rating",type:"select",label:"Min Rating",options:["all","3.5+","4+","4.5+"],allLabel:"Any Rating"},
    {key:"priceLevel",type:"select",label:"Price Level",options:["all","1","2","3"],labels:{"1":"$ Budget","2":"$$ Moderate","3":"$$$ Premium"},allLabel:"Any Price"},
    {key:"hasSocial",type:"select",label:"Social Presence",options:["all","yes","no"],labels:{"yes":"Has Social Media","no":"No Social (Opportunity!)"},allLabel:"Any"},
    {key:"hasWebsite",type:"select",label:"Has Website",options:["all","yes","no"],labels:{"yes":"Has Website","no":"No Website"},allLabel:"Any"},
  ]},
  instagram:{label:"Instagram",filters:[
    {key:"contentType",type:"select",label:"Account Type",options:["all","musician","brand","restaurant","vintage_store"],labels:{musician:"Musician / Artist",brand:"Brand / Company",restaurant:"Restaurant / Chef",vintage_store:"Vintage Store"},allLabel:"All Types"},
    {key:"genre",type:"select",label:"Music Genre",options:["all","Hip-hop","R&B / Soul","Indie / Pop","Pop / Electronic","Trap / Drill","Afrobeats"],allLabel:"Any Genre",showWhen:"musician"},
    {key:"followers",type:"select",label:"Follower Range",options:["all","under25k","25k-100k","100k-500k","500k+"],labels:{"under25k":"Under 25K (Emerging)","25k-100k":"25K-100K (Growing)","100k-500k":"100K-500K (Established)","500k+":"500K+ (Major)"},allLabel:"Any Followers"},
    {key:"engagement",type:"select",label:"Engagement Level",options:["all","high","medium","low"],labels:{high:"High Engagement",medium:"Medium Engagement",low:"Low Engagement"},allLabel:"Any Engagement"},
    {key:"verified",type:"select",label:"Verified",options:["all","yes","no"],labels:{"yes":"Verified Only","no":"Unverified Only"},allLabel:"Any"},
    {key:"hasEmail",type:"select",label:"Email Available",options:["all","yes","no"],labels:{"yes":"Has Email","no":"No Email"},allLabel:"Any"},
    {key:"area",type:"select",label:"Location",options:["all","Los Angeles","Silver Lake","DTLA","Echo Park","Hollywood","Santa Monica","Inglewood","Pasadena","Culver City","Compton","Eagle Rock"],allLabel:"All Locations"},
  ]},
  linkedin:{label:"LinkedIn",filters:[
    {key:"industry",type:"select",label:"Industry",options:["all","Beverage","Retail","Restaurant","Fitness","Beauty & Cosmetics","Music & Entertainment"],allLabel:"All Industries"},
    {key:"seniority",type:"select",label:"Seniority Level",options:["all","c_suite","vp","director","manager"],labels:{c_suite:"C-Suite (CEO/Founder/Owner)",vp:"VP Level",director:"Director Level",manager:"Manager Level"},allLabel:"Any Seniority"},
    {key:"companySize",type:"select",label:"Company Size",options:["all","1-10","11-50","51-200","201-500"],labels:{"1-10":"1-10 (Small Biz)","11-50":"11-50 (Growing)","51-200":"51-200 (Mid-Size)","201-500":"201-500 (Large)"},allLabel:"Any Size"},
    {key:"category",type:"select",label:"Project Type",options:["all","music_video","commercial","retainer_vintage","retainer_restaurant"],labels:{music_video:"Music Video",commercial:"Commercial",retainer_vintage:"Vintage Retainer",retainer_restaurant:"Restaurant Retainer"},allLabel:"All Types"},
  ]},
  tiktok:{label:"TikTok",filters:[
    {key:"contentType",type:"select",label:"Account Type",options:["all","musician","brand","restaurant","vintage_store"],labels:{musician:"Musician / Artist",brand:"Brand / Company",restaurant:"Restaurant",vintage_store:"Vintage Store"},allLabel:"All Types"},
    {key:"genre",type:"select",label:"Music Genre",options:["all","Pop","Rap","Drill","R&B / Neo-soul"],allLabel:"Any Genre",showWhen:"musician"},
    {key:"followers",type:"select",label:"Follower Range",options:["all","under50k","50k-200k","200k-500k","500k+"],labels:{"under50k":"Under 50K","50k-200k":"50K-200K","200k-500k":"200K-500K","500k+":"500K+"},allLabel:"Any Followers"},
    {key:"avgViews",type:"select",label:"Avg Views / Video",options:["all","10k+","25k+","50k+","100k+"],allLabel:"Any Views"},
    {key:"verified",type:"select",label:"Verified",options:["all","yes","no"],labels:{"yes":"Verified Only","no":"Unverified Only"},allLabel:"Any"},
    {key:"area",type:"select",label:"Location",options:["all","Los Angeles","DTLA","South LA","Inglewood","Long Beach","SGV","Pasadena","Venice"],allLabel:"All Locations"},
  ]},
  yelp:{label:"Yelp",filters:[
    {key:"bizType",type:"select",label:"Business Type",options:["all","restaurant","retail"],labels:{restaurant:"Restaurant / Food",retail:"Retail / Vintage"},allLabel:"All Types"},
    {key:"area",type:"select",label:"Area / Neighborhood",options:["all","West Side","East Village","Chinatown","Los Feliz","Culver City","Highland Park","Silver Lake","Burbank"],allLabel:"All Areas"},
    {key:"rating",type:"select",label:"Min Rating",options:["all","3.5+","4+","4.5+"],allLabel:"Any Rating"},
    {key:"priceLevel",type:"select",label:"Price Level",options:["all","1","2","3"],labels:{"1":"$ Budget","2":"$$ Moderate","3":"$$$ Premium"},allLabel:"Any Price"},
    {key:"claimed",type:"select",label:"Listing Status",options:["all","claimed","unclaimed"],labels:{claimed:"Claimed",unclaimed:"Unclaimed (Opportunity!)"},allLabel:"Any Status"},
    {key:"reviews",type:"select",label:"Review Count",options:["all","under50","50-200","200+"],labels:{"under50":"Under 50 (New/Small)","50-200":"50-200 (Established)","200+":"200+ (Popular)"},allLabel:"Any"},
  ]},
};

// Filter scrape DB entries BEFORE scanning — source-aware deep filtering
const filterScrapeDB=(src,filters)=>{
  const items=SCRAPE_DB[src]||[];
  return items.filter(r=>{
    for(const[k,v]of Object.entries(filters)){
      if(!v||v==="all")continue;
      // ── Text search ──
      if(k==="search"){
        const q=v.toLowerCase();
        const searchable=[r.name,r.type,r.area,r.handle,r.genre,r.company,r.industry,r.role,r.contentType].filter(Boolean);
        if(!searchable.some(s=>s.toLowerCase().includes(q)))return false;
        continue;
      }
      // ── Rating (threshold) ──
      if(k==="rating"){
        const min=parseFloat(v);
        if((r.rating||0)<min)return false;
        continue;
      }
      // ── Price level ──
      if(k==="priceLevel"){
        if((r.priceLevel||0)!==parseInt(v))return false;
        continue;
      }
      // ── Followers (range) ──
      if(k==="followers"){
        const f=r.followers||0;
        if(v==="under25k"&&f>=25)return false;
        if(v==="25k-100k"&&(f<25||f>100))return false;
        if(v==="100k-500k"&&(f<100||f>500))return false;
        if(v==="500k+"&&f<500)return false;
        if(v==="under50k"&&f>=50)return false;
        if(v==="50k-200k"&&(f<50||f>200))return false;
        if(v==="200k-500k"&&(f<200||f>500))return false;
        continue;
      }
      // ── Avg views (threshold) ──
      if(k==="avgViews"){
        const min=parseInt(v);
        if((r.avgViews||0)<min)return false;
        continue;
      }
      // ── Reviews count (range) ──
      if(k==="reviews"){
        const rv=r.reviews||0;
        if(v==="under50"&&rv>=50)return false;
        if(v==="50-200"&&(rv<50||rv>200))return false;
        if(v==="200+"&&rv<200)return false;
        continue;
      }
      // ── Booleans (hasSocial, hasWebsite, hasEmail, verified, claimed) ──
      if(k==="hasSocial"||k==="hasWebsite"||k==="hasEmail"||k==="verified"){
        const boolVal=v==="yes";
        if((!!r[k])!==boolVal)return false;
        continue;
      }
      if(k==="claimed"){
        if(v==="claimed"&&!r.claimed)return false;
        if(v==="unclaimed"&&r.claimed)return false;
        continue;
      }
      // ── Exact match for everything else (area, bizType, contentType, genre, industry, seniority, companySize, category) ──
      if(r[k]!==undefined&&r[k]!==v)return false;
    }
    return true;
  }).map(r=>fmtScrapeResult(src,r));
};

// ═══ STYLES ═════════════════════════════════════════════════════════════
const css=`
@import url('${FONT}');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#08080A;--s1:#111114;--s2:#19191D;--s3:#222227;--s4:#2C2C32;
  --b:#28282E;--bh:#38383F;--t:#EEEEF0;--t2:#9E9EA8;--t3:#686872;
  --ac:#D4A843;--acd:rgba(212,168,67,0.1);--acb:rgba(212,168,67,0.25);
  --mb:#1877F2;--ip:#E1306C;--ig:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);
  --ok:#34D399;--no:#F87171;--warn:#FBBF24;--info:#60A5FA;
  --r:8px;--rl:12px;
}
body,#root{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--t);min-height:100vh;font-size:13px;}
.app{display:flex;min-height:100vh;}
/* Sidebar */
.sb{width:210px;background:var(--s1);border-right:1px solid var(--b);display:flex;flex-direction:column;padding:16px 0;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;}
.sb-logo{font-family:'Fraunces',serif;font-size:19px;padding:0 16px 20px;color:var(--ac);display:flex;align-items:center;gap:7px;}
.sb-logo i{font-size:22px;font-style:normal;}
.ns{padding:0 8px;margin-bottom:2px;}
.nl{font-size:8.5px;text-transform:uppercase;letter-spacing:1.8px;color:var(--t3);padding:6px 8px 3px;font-weight:700;}
.ni{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:7px;font-size:12px;color:var(--t2);cursor:pointer;transition:all .1s;margin-bottom:1px;font-weight:500;}
.ni:hover{background:var(--s2);color:var(--t);}
.ni.a{background:var(--acd);color:var(--ac);border:1px solid var(--acb);}
.ni .bd{margin-left:auto;font-size:9.5px;padding:1px 6px;border-radius:10px;font-weight:700;}
.ni .bd-g{background:var(--s3);color:var(--t3);}
.ni .bd-r{background:var(--no);color:#fff;}
/* Main */
.mn{flex:1;padding:20px 26px;overflow-y:auto;max-height:100vh;}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:10px;}
.pt{font-family:'Fraunces',serif;font-size:26px;letter-spacing:-.5px;}
.ps{color:var(--t2);font-size:12px;margin-top:2px;}
/* Buttons */
.btn{display:inline-flex;align-items:center;gap:4px;padding:6px 13px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;border:1px solid var(--b);background:var(--s2);color:var(--t);transition:all .1s;font-family:inherit;white-space:nowrap;}
.btn:hover{background:var(--s3);}
.btn-p{background:var(--ac);color:#0A0A0B;border-color:var(--ac);}
.btn-p:hover{background:#c49a3a;}
.btn-s{padding:4px 9px;font-size:10.5px;}
.btn-d{color:var(--no);}
.tag{font-size:9px;padding:2px 6px;border-radius:8px;font-weight:600;display:inline-flex;align-items:center;gap:2px;}
/* Stats */
.sr{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;}
.sc{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:14px 16px;}
.sc .sl{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;font-weight:600;}
.sc .sv{font-family:'Fraunces',serif;font-size:28px;}
.sc .ss{font-size:10.5px;color:var(--t2);margin-top:2px;}
/* Pipeline */
.pl{display:flex;gap:10px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px;}
.pc{flex:1;min-width:170px;background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:12px;display:flex;flex-direction:column;}
.pch{display:flex;align-items:center;gap:6px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--b);}
.pch .dot{width:7px;height:7px;border-radius:50%;}
.pch .tt{font-size:11.5px;font-weight:700;flex:1;}
.pch .ct{font-size:10px;color:var(--t3);background:var(--s3);padding:1px 6px;border-radius:10px;}
.pcc{display:flex;flex-direction:column;gap:6px;flex:1;overflow-y:auto;max-height:340px;}
.lc{background:var(--s2);border:1px solid var(--b);border-radius:var(--r);padding:10px;cursor:pointer;transition:all .12s;}
.lc:hover{border-color:var(--ac);transform:translateY(-1px);}
.lc .ln{font-size:12px;font-weight:700;margin-bottom:1px;}
.lc .lco{font-size:10.5px;color:var(--t2);margin-bottom:5px;}
.lc .lt{display:flex;gap:4px;flex-wrap:wrap;}
/* Table */
.tw{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);overflow:hidden;margin-bottom:20px;}
.tt-bar{display:flex;gap:6px;padding:12px;border-bottom:1px solid var(--b);flex-wrap:wrap;align-items:center;}
.si{background:var(--s2);border:1px solid var(--b);border-radius:var(--r);padding:7px 10px;color:var(--t);font-size:12px;flex:1;min-width:140px;outline:none;font-family:inherit;}
.si:focus{border-color:var(--ac);}
.sel{background:var(--s2);border:1px solid var(--b);border-radius:var(--r);padding:7px 8px;color:var(--t);font-size:11px;font-family:inherit;outline:none;cursor:pointer;}
table{width:100%;border-collapse:collapse;}
thead th{text-align:left;padding:9px 12px;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--t3);border-bottom:1px solid var(--b);font-weight:600;}
tbody td{padding:9px 12px;font-size:12px;border-bottom:1px solid var(--b);vertical-align:middle;}
tbody tr{transition:background .08s;}
tbody tr:hover{background:var(--s2);}
tbody tr:last-child td{border-bottom:none;}
.sb-badge{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:10px;}
/* DM */
.dm-w{display:grid;grid-template-columns:260px 1fr;height:calc(100vh - 105px);background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);overflow:hidden;}
.dm-l{border-right:1px solid var(--b);display:flex;flex-direction:column;}
.dm-lh{padding:10px 12px;border-bottom:1px solid var(--b);font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:6px;}
.dm-lh .pd{width:16px;height:16px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:800;}
.dm-fl{display:flex;gap:3px;padding:6px 8px;border-bottom:1px solid var(--b);}
.dm-fb{padding:3px 8px;border-radius:5px;font-size:10px;font-weight:600;cursor:pointer;background:transparent;color:var(--t3);border:1px solid transparent;transition:all .08s;font-family:inherit;}
.dm-fb:hover{color:var(--t2);}
.dm-fb.a{background:var(--s3);color:var(--t);border-color:var(--b);}
.dm-ts{flex:1;overflow-y:auto;}
.dm-t{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;transition:background .06s;border-bottom:1px solid var(--b);}
.dm-t:hover{background:var(--s2);}
.dm-t.a{background:var(--acd);border-left:2px solid var(--ac);}
.dm-av{width:34px;height:34px;border-radius:50%;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;position:relative;}
.dm-av .pp{position:absolute;bottom:-1px;right:-1px;width:12px;height:12px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:6px;color:#fff;font-weight:800;border:1.5px solid var(--s1);}
.dm-av .pp.ig{background:var(--ip);}
.dm-av .pp.fb{background:var(--mb);}
.dm-in{flex:1;min-width:0;}
.dm-nm{font-size:11.5px;font-weight:700;display:flex;align-items:center;gap:4px;}
.dm-nm .ur{width:5px;height:5px;border-radius:50%;background:var(--ip);}
.dm-pv{font-size:10.5px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.dm-tm{font-size:9px;color:var(--t3);}
.ch{display:flex;flex-direction:column;height:100%;}
.ch-hd{padding:10px 14px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:8px;}
.ch-nm{font-size:12.5px;font-weight:700;}
.ch-ad{font-size:10px;color:var(--t3);}
.ch-tg{display:flex;gap:3px;margin-left:6px;}
.ch-ac{margin-left:auto;display:flex;gap:4px;}
.ch-ms{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:7px;}
.msg{max-width:72%;padding:9px 12px;border-radius:12px;font-size:12px;line-height:1.55;animation:mp .18s ease;}
@keyframes mp{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:translateY(0);}}
.msg.them{background:var(--s3);align-self:flex-start;border-bottom-left-radius:3px;}
.msg.ai{background:var(--acd);border:1px solid var(--acb);align-self:flex-end;border-bottom-right-radius:3px;}
.msg.me{background:#2563EB;color:#fff;align-self:flex-end;border-bottom-right-radius:3px;}
.msg .mts{font-size:8.5px;color:var(--t3);margin-top:2px;}
.msg.ai .mts{color:rgba(212,168,67,.35);}
.msg.me .mts{color:rgba(255,255,255,.3);}
.msg .ab{font-size:7.5px;text-transform:uppercase;letter-spacing:1px;color:var(--ac);margin-bottom:2px;font-weight:700;}
.ch-bar{padding:10px 14px;border-top:1px solid var(--b);display:flex;gap:5px;align-items:flex-end;}
.ch-inp{flex:1;background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:8px 10px;color:var(--t);font-size:12px;font-family:inherit;outline:none;resize:none;min-height:36px;max-height:90px;}
.ch-inp:focus{border-color:var(--ac);}
.ai-tg{display:flex;align-items:center;gap:3px;padding:4px 8px;border-radius:6px;font-size:9.5px;cursor:pointer;border:1px solid var(--b);background:var(--s2);color:var(--t3);transition:all .1s;font-family:inherit;font-weight:600;}
.ai-tg.on{background:var(--acd);border-color:var(--acb);color:var(--ac);}
.ch-e{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--t3);gap:6px;}
/* Flows */
.fg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;}
.fc{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:16px;transition:border-color .1s;}
.fc:hover{border-color:var(--bh);}
.fc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
.fc-nm{font-size:13px;font-weight:700;}
.fc-kw{font-size:10px;color:var(--t3);font-family:monospace;margin-top:1px;}
.ft{width:34px;height:18px;border-radius:9px;background:var(--s3);border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.ft.on{background:var(--ok);}
.ft::after{content:'';position:absolute;top:2.5px;left:2.5px;width:13px;height:13px;border-radius:50%;background:#fff;transition:transform .2s;}
.ft.on::after{transform:translateX(16px);}
.fc-st{margin:10px 0;padding:10px;background:var(--s2);border-radius:7px;border:1px solid var(--b);}
.fc-step{display:flex;align-items:flex-start;gap:6px;padding:4px 0;font-size:10.5px;color:var(--t2);}
.fc-step .si{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;}
.fc-stats{display:flex;gap:14px;padding-top:8px;border-top:1px solid var(--b);}
.fs{text-align:center;}
.fs .fv{font-size:16px;font-family:'Fraunces',serif;}
.fs .fl{font-size:8.5px;color:var(--t3);text-transform:uppercase;letter-spacing:.6px;}
/* Form captures */
.fcc{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:16px;margin-bottom:10px;transition:border-color .1s;}
.fcc:hover{border-color:var(--bh);}
.fcc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
.fcc-nm{font-size:13px;font-weight:700;}
.fcc-co{font-size:11px;color:var(--t2);}
.fcc-tm{font-size:10px;color:var(--t3);}
.fcc-msg{font-size:11.5px;color:var(--t2);line-height:1.5;margin-bottom:10px;background:var(--s2);padding:8px 10px;border-radius:6px;border:1px solid var(--b);}
.fcc-meta{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}
.fst{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:10px;}
.fst.new{background:rgba(96,165,250,.12);color:var(--info);}
.fst.contacted{background:rgba(251,191,36,.12);color:var(--warn);}
.fst.converted{background:rgba(52,211,153,.12);color:var(--ok);}
/* Calendar */
.cal-hd{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
.cal-nav button{background:var(--s2);border:1px solid var(--b);color:var(--t);width:28px;height:28px;border-radius:7px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:inherit;}
.cal-nav button:hover{background:var(--s3);}
.cal-mo{font-family:'Fraunces',serif;font-size:18px;min-width:180px;}
.cal-vw{display:flex;gap:2px;margin-left:auto;}
.cal-vw button{padding:4px 10px;border-radius:6px;font-size:10.5px;font-weight:600;cursor:pointer;border:1px solid var(--b);background:var(--s2);color:var(--t2);font-family:inherit;}
.cal-vw button.a{background:var(--acd);color:var(--ac);border-color:var(--acb);}
.cal-wk{display:grid;grid-template-columns:54px repeat(7,1fr);border:1px solid var(--b);border-radius:var(--rl);overflow:hidden;background:var(--s1);}
.cal-dh{padding:10px 4px;text-align:center;font-size:9.5px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--b);background:var(--s2);}
.cal-dh.td{color:var(--ac);}
.cal-tc{border-right:1px solid var(--b);}
.cal-tm{padding:4px 7px;font-size:9.5px;color:var(--t3);text-align:right;height:60px;border-bottom:1px solid var(--b);display:flex;align-items:flex-start;justify-content:flex-end;}
.cal-dc{border-right:1px solid var(--b);position:relative;min-height:720px;}
.cal-dc:last-child{border-right:none;}
.cal-sl{height:60px;border-bottom:1px solid var(--b);}
.cal-ev{position:absolute;left:2px;right:2px;border-radius:6px;padding:5px 7px;font-size:10.5px;font-weight:600;cursor:pointer;overflow:hidden;border:1px solid transparent;transition:all .1s;z-index:2;}
.cal-ev:hover{transform:scale(1.02);z-index:3;box-shadow:0 3px 10px rgba(0,0,0,.4);}
.cal-ev .ce-tm{font-size:9px;font-weight:500;opacity:.8;margin-bottom:1px;}
.cal-ev .ce-tt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;}
.bk-card{background:var(--s1);border:1px solid var(--b);border-radius:var(--r);padding:12px 14px;display:flex;gap:12px;transition:border-color .1s;cursor:pointer;margin-bottom:8px;}
.bk-card:hover{border-color:var(--bh);}
.bk-time{display:flex;flex-direction:column;align-items:center;min-width:50px;}
.bk-time .bt{font-size:12.5px;font-weight:700;}
.bk-time .bd{font-size:9.5px;color:var(--t3);}
.bk-body{flex:1;}
.bk-body .bb-t{font-size:12.5px;font-weight:700;margin-bottom:2px;}
.bk-body .bb-c{font-size:11px;color:var(--t2);margin-bottom:5px;}
.bk-body .bb-n{font-size:10.5px;color:var(--t3);line-height:1.45;margin-bottom:6px;background:var(--s2);padding:7px 9px;border-radius:5px;border:1px solid var(--b);}
.bk-body .bb-m{display:flex;gap:4px;flex-wrap:wrap;}
.cal-dl{font-family:'Fraunces',serif;font-size:15px;margin-bottom:6px;display:flex;align-items:center;gap:6px;}
.cal-dl.td{color:var(--ac);}
.cal-dl .dl{font-size:10px;color:var(--t3);font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;}
/* Outreach */
.ou-panel{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:18px;margin-bottom:20px;}
.ou-subj{font-size:13px;font-weight:700;color:var(--ac);margin-bottom:8px;}
.ou-body{background:var(--s2);border:1px solid var(--b);border-radius:var(--r);padding:12px;font-size:12px;line-height:1.65;color:var(--t2);white-space:pre-wrap;}
/* Scraper */
.sp{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:18px;margin-bottom:20px;}
.sp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;}
.sp-c{background:var(--s2);border:1px solid var(--b);border-radius:var(--r);padding:12px;text-align:center;cursor:pointer;transition:all .15s;}
.sp-c:hover{border-color:var(--ac);background:var(--s3);}
.sp-c.scanning{border-color:var(--ac);}
.sp-c.sp-c-active{border-color:var(--ac);background:var(--acd);box-shadow:0 0 0 1px var(--ac);}
.sp-c .sc-i{font-size:24px;margin-bottom:4px;}
.sp-c .sc-n{font-size:12px;font-weight:700;margin-bottom:2px;}
.sp-c .sc-d{font-size:10px;color:var(--t3);}
.sr-i{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;background:var(--s2);border:1px solid var(--b);border-radius:var(--r);margin-bottom:6px;animation:fi .25s ease;}
@keyframes fi{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
.sr-i .sn{font-size:12px;font-weight:700;}
.sr-i .sd{font-size:10.5px;color:var(--t2);}
/* Scraper Filters */
.sf-bar{display:flex;gap:6px;flex-wrap:wrap;padding:14px 0 4px;align-items:center;}
.sf-bar .sel{min-width:110px;}
.sf-bar .si{max-width:200px;}
/* Email Composer */
.em-panel{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);padding:18px;margin-bottom:20px;}
.em-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.em-row label{font-size:10.5px;color:var(--t2);font-weight:600;min-width:50px;}
.em-row input,.em-row textarea{flex:1;background:var(--s2);border:1px solid var(--b);border-radius:7px;padding:8px 10px;color:var(--t);font-size:12px;font-family:inherit;outline:none;}
.em-row input:focus,.em-row textarea:focus{border-color:var(--ac);}
.em-row textarea{min-height:140px;resize:vertical;line-height:1.6;}
.em-tabs{display:flex;gap:2px;margin-bottom:14px;}
.em-tabs button{padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--b);background:var(--s2);color:var(--t2);font-family:inherit;transition:all .1s;}
.em-tabs button.a{background:var(--acd);color:var(--ac);border-color:var(--acb);}
.em-tabs button:hover:not(.a){background:var(--s3);}
.em-cfg{background:var(--s2);border:1px solid var(--b);border-radius:var(--r);padding:12px;margin-bottom:14px;}
.em-cfg-t{font-size:11px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:5px;}
.em-cfg .fg2{margin-bottom:8px;}
.em-cfg .fl2{font-size:10px;}
.em-cfg .fi2{font-size:11px;padding:6px 8px;}
.em-sent{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:var(--r);padding:14px;text-align:center;color:var(--ok);font-weight:600;font-size:12px;margin-top:12px;animation:fi .3s ease;}
/* Modal */
.mo-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(3px);}
.mo{background:var(--s1);border:1px solid var(--b);border-radius:var(--rl);width:500px;max-width:92vw;max-height:85vh;overflow-y:auto;padding:20px;}
.mo-t{font-family:'Fraunces',serif;font-size:20px;margin-bottom:14px;}
.fg2{margin-bottom:10px;}
.fl2{display:block;font-size:10.5px;color:var(--t2);margin-bottom:3px;font-weight:600;}
.fi2{width:100%;background:var(--s2);border:1px solid var(--b);border-radius:7px;padding:7px 10px;color:var(--t);font-size:12px;font-family:inherit;outline:none;}
.fi2:focus{border-color:var(--ac);}
textarea.fi2{min-height:55px;resize:vertical;}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.ma2{display:flex;gap:5px;justify-content:flex-end;margin-top:14px;padding-top:10px;border-top:1px solid var(--b);}
@media(max-width:900px){.sb{display:none;}.sr{grid-template-columns:repeat(2,1fr);}.pl{flex-direction:column;}.dm-w{grid-template-columns:1fr;}.sp-grid{grid-template-columns:1fr 1fr;}.cal-wk{display:none;}}
`;

// ═══ ICONS ══════════════════════════════════════════════════════════════
const X=({t,s=14})=>{const m={
  grid:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  pipe:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>,
  users:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/></svg>,
  search:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  mail:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  chat:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  zap:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  form:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  cal:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  plus:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  send:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bot:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/><path d="M12 2v4M8 7h8"/></svg>,
  arrow:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  trash:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  copy:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  phone:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
};return m[t]||null;};

// ═══ APP ════════════════════════════════════════════════════════════════
export default function App(){
  const td=new Date(2026,3,5);
  const [v,setV]=useState("dashboard");
  const [leads,setLeads]=useState(INIT_LEADS);
  const [threads,setThreads]=useState(INIT_THREADS);
  const [flows,setFlows]=useState(INIT_FLOWS);
  const [forms,setForms]=useState(INIT_FORMS);
  const [bookings,setBookings]=useState(INIT_BOOKINGS);
  // UI state
  const [search,setSearch]=useState("");
  const [fStage,setFStage]=useState("all");
  const [fCat,setFCat]=useState("all");
  const [modal,setModal]=useState(null); // null|"lead"|"booking"|"booking-detail"
  const [editLead,setEditLead]=useState(null);
  const [selLead,setSelLead]=useState(null);
  const [scanning,setScanning]=useState(null);
  const [scanRes,setScanRes]=useState([]);
  const [copied,setCopied]=useState(false);
  // Scraper — source-first, then dynamic filters
  const [scSrc,setScSrc]=useState(null); // selected source before scan
  const [scFilters,setScFilters]=useState({}); // dynamic filters per source
  // Email composer
  const [emTab,setEmTab]=useState("template"); // template | compose
  const [emTo,setEmTo]=useState("");
  const [emSubj,setEmSubj]=useState("");
  const [emBody,setEmBody]=useState("");
  const [emSending,setEmSending]=useState(false);
  const [emSent,setEmSent]=useState(false);
  const [emSmtp,setEmSmtp]=useState({host:"",port:"587",user:"",pass:"",from:""});
  const [emShowCfg,setEmShowCfg]=useState(false);
  // DM
  const [aDm,setADm]=useState(null);
  const [dmIn,setDmIn]=useState("");
  const [aiOn,setAiOn]=useState(true);
  const [aiLoad,setAiLoad]=useState(false);
  const [pFilt,setPFilt]=useState("all");
  const [sFilt,setSFilt]=useState("all");
  // ManyChat integration
  const [mcKey,setMcKey]=useState(()=>{ try{return localStorage.getItem("mc_key")||"";}catch{return "";} });
  const [mcConnected,setMcConnected]=useState(false);
  const [mcPage,setMcPage]=useState(null);
  const [mcSubs,setMcSubs]=useState([]); // subscriber list
  const [mcSelSub,setMcSelSub]=useState(null); // selected subscriber detail
  const [mcFlows,setMcFlows]=useState([]);
  const [mcTags,setMcTags]=useState([]);
  const [mcLoading,setMcLoading]=useState(false);
  const [mcErr,setMcErr]=useState("");
  const [mcMsgText,setMcMsgText]=useState("");
  const [mcSending,setMcSending]=useState(false);
  const [mcSent,setMcSent]=useState(false);
  const [mcSearch,setMcSearch]=useState("");
  const [mcShowSettings,setMcShowSettings]=useState(false);
  // Calendar
  const [calV,setCalV]=useState("list");
  const [calW,setCalW]=useState(new Date(2026,3,6));
  const [bkDetail,setBkDetail]=useState(null);
  const mEnd=useRef(null);

  // Derived
  const stCnt=STAGES.reduce((a,s)=>{a[s]=leads.filter(l=>l.stage===s).length;return a;},{});
  const closedVal=leads.filter(l=>l.stage==="closed").length*8000;
  const unread=threads.filter(t=>t.unread).length;
  const newForms=forms.filter(f=>f.status==="new").length;
  const upBk=[...bookings].sort((a,b)=>a.date-b.date).filter(b=>b.date>=new Date(td.getFullYear(),td.getMonth(),td.getDate()));
  const th=threads.find(t=>t.id===aDm);

  const filtered=leads.filter(l=>{
    if(search&&!l.name.toLowerCase().includes(search.toLowerCase())&&!l.company.toLowerCase().includes(search.toLowerCase()))return false;
    if(fStage!=="all"&&l.stage!==fStage)return false;
    if(fCat!=="all"&&l.category!==fCat)return false;
    return true;
  });

  const fThreads=threads.filter(t=>{
    if(pFilt!=="all"&&t.platform!==pFilt)return false;
    if(sFilt==="unread"&&!t.unread)return false;
    if(sFilt==="starred"&&!t.starred)return false;
    if(sFilt==="awaiting"&&t.status!=="awaiting_reply")return false;
    return true;
  });

  useEffect(()=>{mEnd.current?.scrollIntoView({behavior:"smooth"});},[aDm,threads]);

  // Lead CRUD
  const openAdd=()=>{setEditLead(null);setModal("lead");};
  const openEdit=(l)=>{setEditLead(l);setModal("lead");};
  const saveLead=(d)=>{
    if(editLead)setLeads(p=>p.map(l=>l.id===editLead.id?{...l,...d}:l));
    else setLeads(p=>[...p,{...d,id:Date.now(),created:new Date().toISOString().slice(0,10),lastContact:null}]);
    setModal(null);
  };
  const delLead=(id)=>{setLeads(p=>p.filter(l=>l.id!==id));setModal(null);};
  const moveLead=(id,ns)=>setLeads(p=>p.map(l=>l.id===id?{...l,stage:ns,lastContact:new Date().toISOString().slice(0,10)}:l));

  // Scraper — filters applied BEFORE scan, source-aware
  const setScFilter=(key,val)=>setScFilters(p=>({...p,[key]:val}));
  const resetScFilters=()=>setScFilters({});
  const activeFilterCount=Object.values(scFilters).filter(v=>v&&v!=="all").length;
  const selectScSource=(src)=>{setScSrc(src);setScFilters({});setScanRes([]);setScanning(null);};
  const runScan=()=>{
    if(!scSrc)return;
    setScanning(scSrc);setScanRes([]);
    const results=filterScrapeDB(scSrc,scFilters);
    if(results.length===0){setTimeout(()=>{setScanning(null);setScanRes([]);},800);return;}
    results.forEach((r,i)=>{setTimeout(()=>{setScanRes(p=>[...p,r]);if(i===results.length-1)setTimeout(()=>setScanning(null),500);},600*(i+1));});
  };
  const importLead=(r)=>{
    if(leads.some(l=>l.email===r.email))return;
    setLeads(p=>[...p,{id:Date.now()+Math.random(),name:r.name,company:r.detail.split("·")[0].trim(),email:r.email,phone:"",source:scSrc||scanning||"manual",category:r.category,stage:"cold",notes:r.detail,lastContact:null,created:new Date().toISOString().slice(0,10)}]);
  };

  // Outreach
  const getTpl=(l)=>{const t=OUTREACH[l.category]||OUTREACH.retainer_other;return{subject:t.subject.replace(/\{\{name\}\}/g,l.name.split(" ")[0]).replace(/\{\{company\}\}/g,l.company),body:t.body.replace(/\{\{name\}\}/g,l.name.split(" ")[0]).replace(/\{\{company\}\}/g,l.company)};};
  const copyTpl=(t)=>{navigator.clipboard.writeText(t).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);});};

  // Email composer — load template into compose
  const loadTplToCompose=(l)=>{const tpl=getTpl(l);setEmTo(l.email||"");setEmSubj(tpl.subject);setEmBody(tpl.body);setEmTab("compose");};

  // Email send (simulated + SMTP ready)
  const sendEmail=async()=>{
    if(!emTo.trim()||!emSubj.trim()||!emBody.trim())return;
    setEmSending(true);
    // If SMTP is configured, this would POST to a backend endpoint
    // For now, simulate send delay then show success
    await new Promise(r=>setTimeout(r,1200));
    setEmSending(false);setEmSent(true);
    setTimeout(()=>{setEmSent(false);setEmTo("");setEmSubj("");setEmBody("");},2500);
  };


  // ═══ MANYCHAT API HELPERS ═══
  const mcApi=async(action,params={},body=null)=>{
    const qs=new URLSearchParams({action,...params}).toString();
    const opts={headers:{"X-MC-Key":mcKey,"Content-Type":"application/json"}};
    if(body){opts.method="POST";opts.body=JSON.stringify(body);}
    else{opts.method="GET";}
    const r=await fetch(`/api/manychat?${qs}`,opts);
    return r.json();
  };

  const mcConnect=async()=>{
    if(!mcKey.trim()){setMcErr("Enter your ManyChat API key first.");return;}
    setMcLoading(true);setMcErr("");
    try{
      localStorage.setItem("mc_key",mcKey);
      const pg=await mcApi("page_info");
      if(pg.status==="error"){setMcErr(pg.message||"Invalid API key.");setMcConnected(false);setMcLoading(false);return;}
      setMcPage(pg.data||pg);setMcConnected(true);
      // Load tags & flows in parallel
      const [tags,flows]=await Promise.all([mcApi("get_tags"),mcApi("get_flows")]);
      setMcTags(tags.data||[]);setMcFlows(flows.data||[]);
      setMcShowSettings(false);
    }catch(e){setMcErr("Connection failed: "+e.message);}
    setMcLoading(false);
  };

  const mcDisconnect=()=>{
    setMcConnected(false);setMcPage(null);setMcSubs([]);setMcSelSub(null);
    setMcFlows([]);setMcTags([]);localStorage.removeItem("mc_key");setMcKey("");
  };

  const mcSearchSubs=async(name)=>{
    if(!name.trim()||!mcConnected)return;
    setMcLoading(true);
    try{
      const r=await mcApi("find_by_name",{name});
      setMcSubs(r.data||[]);
    }catch(e){setMcErr(e.message);}
    setMcLoading(false);
  };

  const mcLoadSub=async(subId)=>{
    setMcLoading(true);
    try{
      const r=await mcApi("subscriber_info",{subscriber_id:subId});
      setMcSelSub(r.data||r);
    }catch(e){setMcErr(e.message);}
    setMcLoading(false);
  };

  const mcSendText=async()=>{
    if(!mcMsgText.trim()||!mcSelSub)return;
    setMcSending(true);
    try{
      await mcApi("send_text",{},{subscriber_id:mcSelSub.id,text:mcMsgText});
      setMcSent(true);setMcMsgText("");
      setTimeout(()=>setMcSent(false),2500);
    }catch(e){setMcErr(e.message);}
    setMcSending(false);
  };

  const mcTriggerFlow=async(flowNs)=>{
    if(!mcSelSub)return;
    try{
      await mcApi("send_flow",{},{subscriber_id:mcSelSub.id,flow_ns:flowNs});
    }catch(e){setMcErr(e.message);}
  };

  const mcAddTag=async(tagName)=>{
    if(!mcSelSub)return;
    try{
      await mcApi("add_tag",{},{subscriber_id:mcSelSub.id,tag_name:tagName});
      mcLoadSub(mcSelSub.id); // refresh
    }catch(e){setMcErr(e.message);}
  };

  // DM / AI
  const callAI=async(msgs)=>{try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:AI_SYS,messages:msgs.map(m=>({role:m.from==="them"?"user":"assistant",content:m.text}))})});const d=await r.json();return d.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n")||"Thanks for reaching out — I'll follow up shortly.";}catch{return"Thanks for reaching out — I'll get back to you with details shortly.";}};

  const sendManual=()=>{if(!dmIn.trim()||!aDm)return;const ts=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});setThreads(p=>p.map(t=>t.id===aDm?{...t,unread:false,lastActive:"now",status:"replied",messages:[...t.messages,{from:"me",text:dmIn.trim(),ts}]}:t));setDmIn("");};
  const sendAI=async()=>{if(!aDm)return;setAiLoad(true);const t=threads.find(x=>x.id===aDm);const r=await callAI(t.messages);const ts=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});setThreads(p=>p.map(x=>x.id===aDm?{...x,unread:false,lastActive:"now",status:"replied",messages:[...x.messages,{from:"ai",text:r,ts}]}:x));setAiLoad(false);};

  const toggleStar=(id)=>setThreads(p=>p.map(t=>t.id===id?{...t,starred:!t.starred}:t));
  const addTag=(id,tag)=>setThreads(p=>p.map(t=>t.id===id?{...t,tags:t.tags.includes(tag)?t.tags:[...t.tags,tag]}:t));
  const toggleFlow=(id)=>setFlows(p=>p.map(f=>f.id===id?{...f,active:!f.active}:f));

  // Forms
  const convertForm=(fc)=>{
    if(leads.some(l=>l.email===fc.email))return;
    const cat=fc.service.includes("Music")?"music_video":fc.service.includes("Commercial")?"commercial":"retainer_other";
    setLeads(p=>[...p,{id:Date.now(),name:fc.name,company:fc.company,email:fc.email,phone:fc.phone,source:"form_capture",category:cat,stage:"cold",notes:`Budget: ${fc.budget}. "${fc.message}"`,lastContact:null,created:new Date().toISOString().slice(0,10)}]);
    setForms(p=>p.map(f=>f.id===fc.id?{...f,status:"converted"}:f));
  };
  const convertDm=(t)=>{
    if(leads.some(l=>l.name===t.name))return;
    setLeads(p=>[...p,{id:Date.now(),name:t.name,company:t.handle,email:"",phone:"",source:t.platform==="ig"?"ig_dm":"fb_dm",category:"retainer_other",stage:"contacted",notes:`From ${t.platform.toUpperCase()} DM (${t.adSource}).`,lastContact:new Date().toISOString().slice(0,10),created:new Date().toISOString().slice(0,10)}]);
  };

  // Calendar
  const wDays=Array.from({length:7},(_,i)=>{const d=new Date(calW);d.setDate(d.getDate()+i);return d;});
  const hrs=Array.from({length:12},(_,i)=>i+8);
  const fT=(d)=>d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
  const fD=(d)=>`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getDate()}`;
  const isT=(d)=>d.toDateString()===td.toDateString();
  const grouped={};upBk.forEach(b=>{const k=b.date.toDateString();if(!grouped[k])grouped[k]=[];grouped[k].push(b);});

  const saveNewBk=(d)=>{const[y,m,dy]=d.date.split("-").map(Number);const[h,mn]=(d.time||"10:00").split(":").map(Number);setBookings(p=>[...p,{...d,id:"b"+Date.now(),date:new Date(y,m-1,dy,h,mn),duration:parseInt(d.duration)||30,status:"pending"}]);setModal(null);};

  // ─── NAV ──────────────────────────────────────────────────────────
  const nav=[
    {section:"Overview",items:[{k:"dashboard",icon:"grid",l:"Dashboard"},{k:"pipeline",icon:"pipe",l:"Pipeline",bd:leads.length}]},
    {section:"Inbound",items:[{k:"dm",icon:"chat",l:"Meta DMs",red:unread>0},{k:"manychat",icon:"zap",l:"ManyChat",red:mcConnected},{k:"forms",icon:"form",l:"Form Captures",red:newForms>0},{k:"calendar",icon:"cal",l:"Call Calendar",bd:upBk.length}]},
    {section:"Outbound",items:[{k:"scraper",icon:"search",l:"Lead Scraper"},{k:"leads",icon:"users",l:"All Leads",bd:leads.length},{k:"outreach",icon:"mail",l:"Outreach"}]},
  ];

  return(<>
    <style>{css}</style>
    <div className="app">
      <aside className="sb">
        <div className="sb-logo"><i>◈</i> LeadFlow</div>
        {nav.map(s=>(<nav className="ns" key={s.section}><div className="nl">{s.section}</div>{s.items.map(n=>(<div key={n.k} className={`ni ${v===n.k?"a":""}`} onClick={()=>setV(n.k)}><X t={n.icon}/> {n.l}{n.bd&&<span className="bd bd-g">{n.bd}</span>}{n.red&&<span className="bd bd-r">!</span>}</div>))}</nav>))}
        <div style={{flex:1}}/>
        <div style={{padding:"0 8px",display:"flex",flexDirection:"column",gap:5}}>
          <button className="btn btn-p" style={{width:"100%",justifyContent:"center"}} onClick={openAdd}><X t="plus" s={12}/> Add Lead</button>
        </div>
      </aside>

      <main className="mn">

        {/* ══════════ DASHBOARD ══════════ */}
        {v==="dashboard"&&(<>
          <div className="ph"><div><div className="pt">Dashboard</div><div className="ps">Production company lead pipeline overview</div></div><button className="btn btn-p" onClick={openAdd}><X t="plus" s={12}/> New Lead</button></div>
          <div className="sr">
            <div className="sc" style={{borderTop:"2px solid var(--ac)"}}><div className="sl">Total Leads</div><div className="sv">{leads.length}</div><div className="ss">{unread} unread DMs · {newForms} new forms</div></div>
            {STAGES.filter(s=>s!=="cold").map(s=><div className="sc" key={s} style={{borderTop:`2px solid ${SC[s]}`}}><div className="sl">{SL[s]}</div><div className="sv">{stCnt[s]}</div><div className="ss">{s==="closed"?`$${closedVal.toLocaleString()}`:`${Math.round(stCnt[s]/Math.max(leads.length,1)*100)}%`}</div></div>)}
          </div>
          <div className="pl">{STAGES.map(s=>(<div className="pc" key={s}><div className="pch"><div className="dot" style={{background:SC[s]}}/><div className="tt">{SL[s]}</div><div className="ct">{stCnt[s]}</div></div><div className="pcc">{leads.filter(l=>l.stage===s).map(l=>(<div className="lc" key={l.id} onClick={()=>openEdit(l)}><div className="ln">{l.name}</div><div className="lco">{l.company}</div><div className="lt"><span className="tag" style={{background:"var(--acd)",color:"var(--ac)"}}>{CL_SHORT[l.category]}</span><span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{SRC_L[l.source]}</span></div></div>))}</div></div>))}</div>
        </>)}

        {/* ══════════ PIPELINE ══════════ */}
        {v==="pipeline"&&(<>
          <div className="ph"><div><div className="pt">Pipeline</div><div className="ps">Advance leads through stages with arrow buttons</div></div><button className="btn btn-p" onClick={openAdd}><X t="plus" s={12}/> New Lead</button></div>
          <div className="pl">{STAGES.map(s=>(<div className="pc" key={s}><div className="pch"><div className="dot" style={{background:SC[s]}}/><div className="tt">{SL[s]}</div><div className="ct">{stCnt[s]}</div></div><div className="pcc">{leads.filter(l=>l.stage===s).map(l=>{const si=STAGES.indexOf(s);return(<div className="lc" key={l.id}><div className="ln">{l.name}</div><div className="lco">{l.company}</div><div className="lt" style={{marginBottom:5}}><span className="tag" style={{background:"var(--acd)",color:"var(--ac)"}}>{CL_SHORT[l.category]}</span></div><div style={{display:"flex",gap:4}}>{si>0&&<button className="btn btn-s" onClick={()=>moveLead(l.id,STAGES[si-1])} style={{transform:"scaleX(-1)"}}><X t="arrow" s={11}/></button>}<button className="btn btn-s" onClick={()=>openEdit(l)} style={{flex:1,justifyContent:"center"}}>Edit</button>{si<4&&<button className="btn btn-s btn-p" onClick={()=>moveLead(l.id,STAGES[si+1])}><X t="arrow" s={11}/></button>}</div></div>);})}</div></div>))}</div>
        </>)}

        {/* ══════════ META DM INBOX ══════════ */}
        {v==="dm"&&(<>
          <div className="ph"><div><div className="pt">Meta DM Inbox</div><div className="ps">Unified IG + Facebook · AI replies · ManyChat automation</div></div></div>
          <div className="dm-w">
            <div className="dm-l">
              <div className="dm-lh"><div className="pd" style={{background:"var(--ig)"}}>IG</div><div className="pd" style={{background:"var(--mb)"}}>fb</div> Messages</div>
              <div className="dm-fl">{[["all","All"],["unread","Unread"],["starred","★"],["awaiting","Needs Reply"]].map(([k,l])=><button key={k} className={`dm-fb ${sFilt===k?"a":""}`} onClick={()=>setSFilt(k)}>{l}</button>)}</div>
              <div style={{display:"flex",gap:2,padding:"4px 8px",borderBottom:"1px solid var(--b)"}}>{[["all","All"],["ig","IG"],["fb","FB"]].map(([k,l])=><button key={k} className={`dm-fb ${pFilt===k?"a":""}`} onClick={()=>setPFilt(k)}>{l}</button>)}</div>
              <div className="dm-ts">{fThreads.map(t=>(<div key={t.id} className={`dm-t ${aDm===t.id?"a":""}`} onClick={()=>{setADm(t.id);setThreads(p=>p.map(x=>x.id===t.id?{...x,unread:false}:x));}}>
                <div className="dm-av">{t.avatar}<div className={`pp ${t.platform}`}>{t.platform==="ig"?"IG":"fb"}</div></div>
                <div className="dm-in"><div className="dm-nm">{t.name}{t.unread&&<span className="ur"/>}{t.starred&&<span style={{color:"var(--warn)",fontSize:9}}>★</span>}</div><div className="dm-pv">{t.messages[t.messages.length-1]?.text.slice(0,45)}…</div></div>
                <div className="dm-tm">{t.lastActive}</div>
              </div>))}</div>
            </div>
            <div className="ch">
              {th?(<>
                <div className="ch-hd">
                  <div className="dm-av" style={{width:30,height:30,fontSize:14}}>{th.avatar}<div className={`pp ${th.platform}`} style={{width:11,height:11,fontSize:5}}>{th.platform==="ig"?"IG":"fb"}</div></div>
                  <div><div className="ch-nm">{th.name} <span style={{fontWeight:400,color:"var(--t3)",fontSize:10}}>{th.handle}</span></div><div className="ch-ad">Via: {th.adSource}</div></div>
                  <div className="ch-tg">{th.tags.map(t=><span key={t} className="tag" style={{background:TAGS[t]?.bg,color:TAGS[t]?.color}}>{TAGS[t]?.label}</span>)}</div>
                  <div className="ch-ac">
                    <button className="btn btn-s" onClick={()=>toggleStar(th.id)}>{th.starred?"★":"☆"}</button>
                    <select className="btn btn-s" style={{appearance:"auto"}} onChange={e=>{if(e.target.value)addTag(th.id,e.target.value);e.target.value="";}}><option value="">+ Tag</option>{Object.entries(TAGS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
                    <button className="btn btn-s" onClick={()=>convertDm(th)}>+ Lead</button>
                    <button className="btn btn-s btn-p" onClick={()=>{setModal("booking");}}>📞 Book</button>
                  </div>
                </div>
                <div className="ch-ms">
                  {th.messages.map((m,i)=>(<div key={i} className={`msg ${m.from}`}>{m.from==="ai"&&<div className="ab">✦ AI Reply</div>}{m.text}<div className="mts">{m.ts}</div></div>))}
                  {aiLoad&&<div className="msg ai" style={{opacity:.5}}><div className="ab">✦ Generating…</div>● ● ●</div>}
                  <div ref={mEnd}/>
                </div>
                <div className="ch-bar">
                  <button className={`ai-tg ${aiOn?"on":""}`} onClick={()=>setAiOn(!aiOn)}><X t="bot" s={11}/> AI {aiOn?"ON":"OFF"}</button>
                  {aiOn?<button className="btn btn-p" style={{flex:1,justifyContent:"center"}} onClick={sendAI} disabled={aiLoad}><X t="bot" s={12}/> {aiLoad?"Generating…":"Generate AI Reply"}</button>:(<><textarea className="ch-inp" placeholder="Type reply…" value={dmIn} onChange={e=>setDmIn(e.target.value)} rows={1} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendManual();}}}/><button className="btn btn-p" onClick={sendManual}><X t="send" s={12}/></button></>)}
                </div>
              </>):<div className="ch-e"><div style={{fontSize:40,opacity:.2}}>💬</div><div style={{fontSize:12}}>Select a conversation</div></div>}
            </div>
          </div>
        </>)}

        {/* ══════════ MANYCHAT ══════════ */}
        {v==="manychat"&&(<>
          <div className="ph">
            <div><div className="pt">ManyChat <span style={{fontSize:11,color:mcConnected?"var(--ok)":"var(--t3)",fontWeight:400}}>{mcConnected?"● Connected":"○ Not connected"}</span></div><div className="ps">Instagram DM inbox, subscriber management & automation</div></div>
            <button className="btn btn-s" onClick={()=>setMcShowSettings(!mcShowSettings)}>⚙ Settings</button>
          </div>

          {/* SETTINGS PANEL */}
          {mcShowSettings&&(<div className="sp" style={{border:"1px solid var(--ac)",borderRadius:"var(--rl)"}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>ManyChat API Configuration</div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:12}}>Enter your ManyChat API key from Settings → Integrations → API in your ManyChat dashboard</div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"var(--t3)",marginBottom:3}}>API Key</div>
                <input className="si" type="password" placeholder="Paste your ManyChat API key…" value={mcKey} onChange={e=>setMcKey(e.target.value)} style={{width:"100%"}}/>
              </div>
              {!mcConnected?<button className="btn btn-p" onClick={mcConnect} disabled={mcLoading}>{mcLoading?"Connecting…":"Connect"}</button>
              :<button className="btn btn-s" onClick={mcDisconnect} style={{color:"var(--no)"}}>Disconnect</button>}
            </div>
            {mcErr&&<div style={{fontSize:11,color:"var(--no)",marginBottom:8}}>{mcErr}</div>}
            {mcConnected&&mcPage&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <span className="tag" style={{background:"rgba(52,211,153,.12)",color:"var(--ok)"}}>✓ Connected to: {mcPage.name||"ManyChat Page"}</span>
              <span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{mcTags.length} tags loaded</span>
              <span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{mcFlows.length} flows loaded</span>
            </div>}
          </div>)}

          {/* NOT CONNECTED STATE */}
          {!mcConnected&&!mcShowSettings&&(<div className="sp" style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:40,marginBottom:10,opacity:.3}}>⚡</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Connect ManyChat</div>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:16,maxWidth:400,margin:"0 auto 16px"}}>Link your ManyChat account to manage Instagram DM subscribers, send messages, and trigger automation flows directly from LeadFlow.</div>
            <button className="btn btn-p" onClick={()=>setMcShowSettings(true)}>⚙ Configure API Key</button>
          </div>)}

          {/* CONNECTED — SUBSCRIBER INBOX */}
          {mcConnected&&(<>
            {/* Search bar */}
            <div className="sp" style={{paddingBottom:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input className="si" placeholder="Search subscribers by name…" value={mcSearch} onChange={e=>setMcSearch(e.target.value)} style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&mcSearchSubs(mcSearch)}/>
                <button className="btn btn-p" onClick={()=>mcSearchSubs(mcSearch)} disabled={mcLoading}>{mcLoading?"Searching…":"Search"}</button>
              </div>
            </div>

            <div style={{display:"flex",gap:12,minHeight:400}}>
              {/* LEFT: Subscriber list */}
              <div style={{width:280,flexShrink:0}}>
                {mcSubs.length>0?mcSubs.map(sub=>(
                  <div key={sub.id} className={`ni ${mcSelSub?.id===sub.id?"a":""}`} onClick={()=>mcLoadSub(sub.id)} style={{padding:"10px 12px",marginBottom:4,borderRadius:"var(--r)",background:mcSelSub?.id===sub.id?"var(--acd)":"var(--s1)",border:"1px solid "+(mcSelSub?.id===sub.id?"var(--acb)":"var(--b)"),cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{sub.first_name?sub.first_name[0]:"?"}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:600}}>{sub.first_name} {sub.last_name}</div>
                        <div style={{fontSize:10,color:"var(--t3)"}}>{sub.status||"subscriber"}</div>
                      </div>
                    </div>
                  </div>
                )):<div style={{padding:20,textAlign:"center",color:"var(--t3)",fontSize:11}}>{mcSubs.length===0?"Search for subscribers above":"No subscribers found"}</div>}
              </div>

              {/* RIGHT: Subscriber detail + actions */}
              <div style={{flex:1}}>
                {mcSelSub?(<div className="sp">
                  {/* Header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:700}}>{mcSelSub.first_name} {mcSelSub.last_name}</div>
                      <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>ID: {mcSelSub.id} · {mcSelSub.ig_username?"@"+mcSelSub.ig_username:""}</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <span className="tag" style={{background:mcSelSub.live_chat_url?"rgba(52,211,153,.12)":"var(--s3)",color:mcSelSub.live_chat_url?"var(--ok)":"var(--t3)"}}>{mcSelSub.status||"Active"}</span>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                    {mcSelSub.email&&<div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:"8px 10px"}}><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1}}>Email</div><div style={{fontSize:12}}>{mcSelSub.email}</div></div>}
                    {mcSelSub.phone&&<div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:"8px 10px"}}><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1}}>Phone</div><div style={{fontSize:12}}>{mcSelSub.phone}</div></div>}
                    {mcSelSub.ig_username&&<div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:"8px 10px"}}><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1}}>Instagram</div><div style={{fontSize:12}}>@{mcSelSub.ig_username}</div></div>}
                    {mcSelSub.last_interaction&&<div style={{background:"var(--s2)",borderRadius:"var(--r)",padding:"8px 10px"}}><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1}}>Last Interaction</div><div style={{fontSize:12}}>{new Date(mcSelSub.last_interaction).toLocaleDateString()}</div></div>}
                  </div>

                  {/* Tags */}
                  {mcSelSub.tags&&mcSelSub.tags.length>0&&<div style={{marginBottom:16}}>
                    <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Tags</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{mcSelSub.tags.map(t=><span key={t.id} className="tag" style={{background:"var(--acd)",color:"var(--ac)"}}>{t.name}</span>)}</div>
                  </div>}

                  {/* Custom fields */}
                  {mcSelSub.custom_fields&&mcSelSub.custom_fields.length>0&&<div style={{marginBottom:16}}>
                    <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Custom Fields</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{mcSelSub.custom_fields.filter(f=>f.value).map(f=><div key={f.id} style={{background:"var(--s2)",borderRadius:"var(--r)",padding:"6px 10px"}}><div style={{fontSize:9,color:"var(--t3)"}}>{f.name}</div><div style={{fontSize:11}}>{String(f.value)}</div></div>)}</div>
                  </div>}

                  {/* ─── SEND MESSAGE ─── */}
                  <div style={{borderTop:"1px solid var(--b)",paddingTop:14,marginTop:8}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Send Instagram Message</div>
                    <div style={{fontSize:10,color:"var(--t3)",marginBottom:8}}>Note: only works within 24hr of subscriber's last interaction</div>
                    <div style={{display:"flex",gap:6}}>
                      <textarea className="si" rows={2} placeholder="Type your message…" value={mcMsgText} onChange={e=>setMcMsgText(e.target.value)} style={{flex:1,resize:"vertical"}}/>
                      <button className="btn btn-p" onClick={mcSendText} disabled={mcSending||!mcMsgText.trim()} style={{alignSelf:"flex-end"}}>{mcSending?"Sending…":mcSent?"Sent ✓":"Send"}</button>
                    </div>
                  </div>

                  {/* ─── TRIGGER FLOW ─── */}
                  {mcFlows.length>0&&<div style={{borderTop:"1px solid var(--b)",paddingTop:14,marginTop:14}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Trigger Automation Flow</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{mcFlows.map(f=><button key={f.ns} className="btn btn-s" onClick={()=>mcTriggerFlow(f.ns)}><X t="zap" s={10}/> {f.name}</button>)}</div>
                  </div>}

                  {/* ─── ADD TAG ─── */}
                  {mcTags.length>0&&<div style={{borderTop:"1px solid var(--b)",paddingTop:14,marginTop:14}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Add Tag</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{mcTags.filter(t=>!mcSelSub.tags?.some(st=>st.id===t.id)).slice(0,12).map(t=><button key={t.id} className="btn btn-s" onClick={()=>mcAddTag(t.name)}>+ {t.name}</button>)}</div>
                  </div>}

                  {/* ─── IMPORT TO LEADFLOW ─── */}
                  <div style={{borderTop:"1px solid var(--b)",paddingTop:14,marginTop:14}}>
                    <button className="btn btn-p" onClick={()=>{
                      if(leads.some(l=>l.name===`${mcSelSub.first_name} ${mcSelSub.last_name}`))return;
                      setLeads(p=>[...p,{id:Date.now(),name:`${mcSelSub.first_name} ${mcSelSub.last_name}`,company:mcSelSub.ig_username?"@"+mcSelSub.ig_username:"ManyChat",email:mcSelSub.email||"",phone:mcSelSub.phone||"",source:"ig_dm",category:"music_video",stage:"cold",notes:`ManyChat subscriber. ${mcSelSub.ig_username?"IG: @"+mcSelSub.ig_username:""}`,lastContact:mcSelSub.last_interaction?mcSelSub.last_interaction.slice(0,10):null,created:new Date().toISOString().slice(0,10)}]);
                    }} disabled={leads.some(l=>l.name===`${mcSelSub.first_name} ${mcSelSub.last_name}`)}>{leads.some(l=>l.name===`${mcSelSub.first_name} ${mcSelSub.last_name}`)?"Already in Pipeline ✓":"Import to LeadFlow Pipeline"}</button>
                  </div>
                </div>):<div className="sp" style={{textAlign:"center",padding:"40px 20px",color:"var(--t3)"}}>
                  <div style={{fontSize:30,marginBottom:8,opacity:.3}}>👤</div>
                  <div style={{fontSize:12}}>Search and select a subscriber to view details, send messages, and manage tags</div>
                </div>}
              </div>
            </div>
          </>)}
        </>)}

        {/* ══════════ AUTOMATION FLOWS ══════════ */}
        {v==="flows"&&(<>
          <div className="ph"><div><div className="pt">Automation Flows</div><div className="ps">ManyChat-style keyword triggers & auto-reply sequences</div></div></div>
          <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
            {[["Triggered",flows.reduce((a,f)=>a+f.stats.triggered,0),null],["Replied",flows.reduce((a,f)=>a+f.stats.replied,0),null],["Converted",flows.reduce((a,f)=>a+f.stats.converted,0),"var(--ok)"],["Conv %",Math.round(flows.reduce((a,f)=>a+f.stats.converted,0)/Math.max(flows.reduce((a,f)=>a+f.stats.triggered,0),1)*100)+"%","var(--ac)"]].map(([l,v,c])=><div key={l} style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:"var(--r)",padding:"12px 16px",flex:1,minWidth:120}}><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:3,fontWeight:600}}>{l}</div><div style={{fontFamily:"'Fraunces',serif",fontSize:24,color:c||"var(--t)"}}>{v}</div></div>)}
          </div>
          <div className="fg-grid">{flows.map(f=>(<div className="fc" key={f.id}><div className="fc-top"><div><div className="fc-nm">{f.name}</div><div className="fc-kw">{f.keywords.map(k=>`"${k}"`).join(", ")}</div></div><button className={`ft ${f.active?"on":""}`} onClick={()=>toggleFlow(f.id)}/></div><div style={{display:"flex",gap:3,marginBottom:6}}><span className="tag" style={{background:f.platform==="ig"?"rgba(225,48,108,.12)":f.platform==="fb"?"rgba(24,119,242,.12)":"var(--acd)",color:f.platform==="ig"?"var(--ip)":f.platform==="fb"?"var(--mb)":"var(--ac)"}}>{f.platform==="ig"?"IG":f.platform==="fb"?"FB":"All"}</span><span className="tag" style={{background:f.active?"rgba(52,211,153,.12)":"rgba(248,113,113,.12)",color:f.active?"var(--ok)":"var(--no)"}}>{f.active?"Active":"Paused"}</span></div><div className="fc-st">{f.steps.map((s,i)=>(<div className="fc-step" key={i}><div className="si" style={{background:s.type==="reply"?"rgba(64,196,255,.12)":s.type==="wait"?"rgba(251,191,36,.12)":"rgba(105,240,174,.12)",color:s.type==="reply"?"var(--info)":s.type==="wait"?"var(--warn)":"var(--ok)"}}>{s.type==="reply"?"💬":s.type==="wait"?"⏳":"🏷️"}</div><div>{s.type==="reply"?s.text.slice(0,70)+"…":s.type==="wait"?"Wait for reply":`Tag: ${TAGS[s.tag]?.label}`}</div></div>))}</div><div className="fc-stats">{[["Triggered",f.stats.triggered],["Replied",f.stats.replied],["Converted",f.stats.converted],["%",Math.round(f.stats.converted/Math.max(f.stats.triggered,1)*100)+"%"]].map(([l,v])=><div className="fs" key={l}><div className="fv">{v}</div><div className="fl">{l}</div></div>)}</div></div>))}</div>
        </>)}

        {/* ══════════ FORM CAPTURES ══════════ */}
        {v==="forms"&&(<>
          <div className="ph"><div><div className="pt">Form Captures</div><div className="ps">Leads from ad forms — review & convert to pipeline</div></div></div>
          {forms.map(fc=>(<div className="fcc" key={fc.id}><div className="fcc-top"><div><div className="fcc-nm">{fc.name}</div><div className="fcc-co">{fc.company} · {fc.email}</div></div><div className="fcc-tm">{fc.submitted}</div></div><div className="fcc-msg">"{fc.message}"</div><div className="fcc-meta"><span className={`fst ${fc.status}`}>{fc.status==="new"?"● New":fc.status==="contacted"?"● Contacted":"✓ Converted"}</span><span className="tag" style={{background:"rgba(96,165,250,.12)",color:"var(--info)"}}>{fc.adName}</span><span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{fc.service}</span><span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{fc.budget}</span>{fc.status!=="converted"&&<button className="btn btn-s btn-p" style={{marginLeft:"auto"}} onClick={()=>convertForm(fc)}>Convert</button>}</div></div>))}
        </>)}

        {/* ══════════ CALENDAR ══════════ */}
        {v==="calendar"&&(<>
          <div className="ph"><div><div className="pt">Call Calendar</div><div className="ps">Discovery calls, creative briefs, follow-ups from DMs, forms & bookings</div></div><button className="btn btn-p" onClick={()=>setModal("booking")}><X t="phone" s={12}/> Book Call</button></div>
          <div className="cal-hd">
            <div className="cal-nav" style={{display:"flex",gap:4}}><button onClick={()=>{const d=new Date(calW);d.setDate(d.getDate()-7);setCalW(d);}}>‹</button><button onClick={()=>{const d=new Date(calW);d.setDate(d.getDate()+7);setCalW(d);}}>›</button></div>
            <div className="cal-mo">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][calW.getMonth()]} {calW.getFullYear()}</div>
            <div className="cal-vw"><button className={calV==="list"?"a":""} onClick={()=>setCalV("list")}>List</button><button className={calV==="week"?"a":""} onClick={()=>setCalV("week")}>Week</button></div>
          </div>
          {calV==="list"&&(<div>{Object.entries(grouped).map(([ds,bks])=>{const d=new Date(ds);return(<div key={ds} style={{marginBottom:14}}><div className={`cal-dl ${isT(d)?"td":""}`}>{fD(d)}{isT(d)&&<span className="dl">TODAY</span>}</div>{bks.map(b=>(<div className="bk-card" key={b.id} onClick={()=>setBkDetail(b)}><div className="bk-time"><div className="bt">{fT(b.date)}</div><div className="bd">{b.duration}m</div></div><div className="bk-body"><div className="bb-t">{b.title}</div><div className="bb-c">{b.contact}{b.email?` · ${b.email}`:""}</div>{b.notes&&<div className="bb-n">{b.notes}</div>}<div className="bb-m"><span className="tag" style={{background:(CALL_TYPES[b.type]?.color||"#888")+"1A",color:CALL_TYPES[b.type]?.color}}>{CALL_TYPES[b.type]?.icon} {CALL_TYPES[b.type]?.label}</span><span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{SRC_ICO[b.source]||"📌"} {b.source.replace(/_/g," ")}</span>{b.category&&TAGS[b.category]&&<span className="tag" style={{background:TAGS[b.category].bg,color:TAGS[b.category].color}}>{TAGS[b.category].label}</span>}<span className="tag" style={{background:b.status==="confirmed"?"rgba(52,211,153,.12)":"rgba(251,191,36,.12)",color:b.status==="confirmed"?"var(--ok)":"var(--warn)"}}>{b.status}</span></div></div></div>))}</div>);})}
            {Object.keys(grouped).length===0&&<div style={{textAlign:"center",padding:50,color:"var(--t3)"}}>No upcoming calls</div>}
          </div>)}
          {calV==="week"&&(<div className="cal-wk"><div className="cal-dh cal-tc" style={{background:"var(--s2)"}}/>{wDays.map((d,i)=><div key={i} className={`cal-dh ${isT(d)?"td":""}`}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]} {d.getDate()}</div>)}<div className="cal-tc">{hrs.map(h=><div className="cal-tm" key={h}>{h>12?h-12:h}{h>=12?"p":"a"}</div>)}</div>{wDays.map((day,di)=>{const db=bookings.filter(b=>b.date.toDateString()===day.toDateString());return(<div className="cal-dc" key={di}>{hrs.map(h=><div className="cal-sl" key={h}/>)}{db.map(b=>{const tp=(b.date.getHours()-8)*60+(b.date.getMinutes()/60*60);const ht=(b.duration/60)*60;const ct=CALL_TYPES[b.type];return(<div key={b.id} className="cal-ev" onClick={()=>setBkDetail(b)} style={{top:tp,height:Math.max(ht,30),background:(ct?.color||"#888")+"1A",borderColor:(ct?.color||"#888")+"40",color:ct?.color}}><div className="ce-tm">{fT(b.date)}</div><div className="ce-tt">{b.title}</div></div>);})}</div>);})}</div>)}
        </>)}

        {/* ══════════ LEADS TABLE ══════════ */}
        {v==="leads"&&(<>
          <div className="ph"><div><div className="pt">All Leads</div><div className="ps">{filtered.length} leads</div></div><button className="btn btn-p" onClick={openAdd}><X t="plus" s={12}/> New Lead</button></div>
          <div className="tw"><div className="tt-bar"><input className="si" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/><select className="sel" value={fStage} onChange={e=>setFStage(e.target.value)}><option value="all">All Stages</option>{STAGES.map(s=><option key={s} value={s}>{SL[s]}</option>)}</select><select className="sel" value={fCat} onChange={e=>setFCat(e.target.value)}><option value="all">All Categories</option>{CATS.map(c=><option key={c} value={c}>{CL[c]}</option>)}</select></div>
          <div style={{overflowX:"auto"}}><table><thead><tr><th>Name</th><th>Company</th><th>Category</th><th>Source</th><th>Stage</th><th>Last Contact</th><th></th></tr></thead><tbody>{filtered.map(l=>(<tr key={l.id} onClick={()=>openEdit(l)} style={{cursor:"pointer"}}><td style={{fontWeight:700}}>{l.name}</td><td style={{color:"var(--t2)"}}>{l.company}</td><td><span className="tag" style={{background:"var(--acd)",color:"var(--ac)"}}>{CL_SHORT[l.category]}</span></td><td><span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{SRC_L[l.source]}</span></td><td><span className="sb-badge" style={{background:SC[l.stage]+"18",color:SC[l.stage]}}><span style={{width:5,height:5,borderRadius:"50%",background:SC[l.stage],display:"inline-block"}}/> {SL[l.stage]}</span></td><td style={{color:"var(--t3)",fontSize:11}}>{l.lastContact||"—"}</td><td><button className="btn btn-s" onClick={e=>{e.stopPropagation();setSelLead(l);setV("outreach");}}><X t="mail" s={11}/></button></td></tr>))}{filtered.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:36,color:"var(--t3)"}}>No leads found</td></tr>}</tbody></table></div></div>
        </>)}

        {/* ══════════ SCRAPER ══════════ */}
        {v==="scraper"&&(<>
          <div className="ph"><div><div className="pt">Lead Scraper</div><div className="ps">Choose a source, set your filters, then scan</div></div></div>

          {/* STEP 1 — SOURCE SELECTION */}
          <div className="sp">
            <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>1. Select a Source</div>
            <div style={{fontSize:10.5,color:"var(--t3)",marginBottom:10}}>Each source has its own set of filters</div>
            <div className="sp-grid">{[{k:"google_maps",i:"📍",n:"Google Maps",d:"Local businesses"},{k:"instagram",i:"📸",n:"Instagram",d:"Artists & brands"},{k:"linkedin",i:"💼",n:"LinkedIn",d:"Decision makers"},{k:"tiktok",i:"🎵",n:"TikTok",d:"Viral creators"},{k:"yelp",i:"⭐",n:"Yelp",d:"Restaurants & retail"}].map(s=><div key={s.k} className={`sp-c ${scSrc===s.k?"sp-c-active":""}`} onClick={()=>selectScSource(s.k)}><div className="sc-i">{s.i}</div><div className="sc-n">{s.n}</div><div className="sc-d">{s.d}</div></div>)}</div>
          </div>

          {/* STEP 2 — DYNAMIC FILTERS (shown after source selection) */}
          {scSrc&&SRC_FILTERS[scSrc]&&(<div className="sp">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:1}}>2. Filter {SRC_FILTERS[scSrc].label} Results</div>
                <div style={{fontSize:10.5,color:"var(--t3)"}}>Set criteria before scanning — only matching leads will appear</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {activeFilterCount>0&&<button className="btn btn-s" onClick={resetScFilters}>Reset All ({activeFilterCount})</button>}
              </div>
            </div>
            {/* Search bar */}
            <div style={{marginBottom:10}}>
              <input className="si" placeholder="Search by name, keyword, location…" value={scFilters.search||""} onChange={e=>setScFilter("search",e.target.value)} style={{width:"100%",maxWidth:400}}/>
            </div>
            {/* Dynamic filter dropdowns */}
            <div className="sf-bar" style={{flexWrap:"wrap"}}>
              {SRC_FILTERS[scSrc].filters.map(f=>{
                // Conditional visibility: genre filter only shows when contentType is "musician"
                if(f.showWhen&&scFilters.contentType!==f.showWhen)return null;
                return <select key={f.key} className="sel" value={scFilters[f.key]||"all"} onChange={e=>setScFilter(f.key,e.target.value)}>
                  <option value="all">{f.allLabel}</option>
                  {f.options.filter(o=>o!=="all").map(o=><option key={o} value={o}>{f.labels?.[o]||o}</option>)}
                </select>;
              })}
            </div>
            {/* Active filter tags */}
            {activeFilterCount>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
              {Object.entries(scFilters).filter(([k,v])=>v&&v!=="all").map(([k,v])=>{
                const fDef=SRC_FILTERS[scSrc].filters.find(f=>f.key===k);
                const label=k==="search"?`"${v}"`:fDef?.labels?.[v]||v;
                const icon=k==="area"?"📍":k==="genre"?"🎵":k==="search"?"🔍":"";
                return <span key={k} className="tag" style={{background:"var(--acd)",color:"var(--ac)"}}>{icon}{icon?" ":""}{fDef?.label||k}: {label} <span style={{cursor:"pointer",marginLeft:4,opacity:.7}} onClick={()=>setScFilter(k,"all")}>×</span></span>;
              })}
            </div>}
            {/* SCAN BUTTON */}
            <div style={{marginTop:14}}>
              <button className={`btn btn-p ${scanning?"":""}`} disabled={!!scanning} onClick={runScan} style={{padding:"8px 22px",fontSize:13}}>
                {scanning===scSrc?"⏳ Scanning…":`Scan ${SRC_FILTERS[scSrc].label}`} {activeFilterCount>0?`(${activeFilterCount} filter${activeFilterCount>1?"s":""})`:""}
              </button>
            </div>
          </div>)}

          {/* RESULTS */}
          {scanRes.length>0&&<div className="sp"><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Results ({scanRes.length})</div>{scanRes.map((r,i)=>{const ex=leads.some(l=>l.email===r.email);return<div className="sr-i" key={i}><div><div className="sn">{r.name}</div><div className="sd">{r.detail}{r.email?" · "+r.email:""}</div></div>{r.email?<button className={`btn btn-s ${ex?"":"btn-p"}`} disabled={ex} onClick={()=>importLead(r)}>{ex?"Added ✓":"+ Import"}</button>:<span style={{fontSize:10,color:"var(--t3)"}}>No email</span>}</div>;})}</div>}
          {scanning===null&&scanRes.length===0&&scSrc&&<div className="sp" style={{textAlign:"center",padding:20,color:"var(--t3)",fontSize:12}}>{activeFilterCount>0?"No results matched your filters. Try adjusting or resetting filters.":""}</div>}
        </>)}

        {/* ══════════ OUTREACH ══════════ */}
        {v==="outreach"&&(<>
          <div className="ph"><div><div className="pt">Outreach</div><div className="ps">Templates, email composer & send</div></div></div>
          <div className="em-tabs">
            <button className={emTab==="template"?"a":""} onClick={()=>setEmTab("template")}>Templates</button>
            <button className={emTab==="compose"?"a":""} onClick={()=>setEmTab("compose")}><X t="mail" s={11}/> Compose & Send</button>
          </div>

          {emTab==="template"&&(<>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>{leads.filter(l=>l.stage!=="closed").map(l=><button key={l.id} className={`btn btn-s ${selLead?.id===l.id?"btn-p":""}`} onClick={()=>setSelLead(l)}>{l.name}</button>)}</div>
            {selLead?<div className="ou-panel"><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><div style={{fontSize:10,color:"var(--t3)",marginBottom:2}}>TO: {selLead.name} · {selLead.email}</div><div className="ou-subj">Subject: {getTpl(selLead).subject}</div></div><div style={{display:"flex",gap:4}}><button className="btn btn-s" onClick={()=>copyTpl(getTpl(selLead).body)}><X t="copy" s={11}/> {copied?"Copied!":"Copy"}</button><button className="btn btn-s btn-p" onClick={()=>loadTplToCompose(selLead)}><X t="send" s={11}/> Send</button></div></div><div className="ou-body">{getTpl(selLead).body}</div><div style={{marginTop:10,display:"flex",gap:4}}><span className="tag" style={{background:"var(--acd)",color:"var(--ac)"}}>{CL[selLead.category]}</span><span className="tag" style={{background:"var(--s3)",color:"var(--t2)"}}>{SRC_L[selLead.source]}</span></div></div>:<div className="ou-panel" style={{textAlign:"center",padding:50,color:"var(--t3)"}}>Select a lead above to preview template</div>}
          </>)}

          {emTab==="compose"&&(<>
            <div className="em-panel">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:700}}>Compose Email</div>
                <button className="btn btn-s" onClick={()=>setEmShowCfg(!emShowCfg)}>{emShowCfg?"Hide":"⚙ SMTP"} Settings</button>
              </div>
              {emShowCfg&&<div className="em-cfg">
                <div className="em-cfg-t">⚙ SMTP / API Configuration</div>
                <div style={{fontSize:10,color:"var(--t3)",marginBottom:10}}>Connect your email service to send directly. Supports SMTP, Gmail API, or SendGrid.</div>
                <div className="fr2">
                  <div className="fg2"><label className="fl2">SMTP Host</label><input className="fi2" placeholder="smtp.gmail.com" value={emSmtp.host} onChange={e=>setEmSmtp(p=>({...p,host:e.target.value}))}/></div>
                  <div className="fg2"><label className="fl2">Port</label><input className="fi2" placeholder="587" value={emSmtp.port} onChange={e=>setEmSmtp(p=>({...p,port:e.target.value}))}/></div>
                  <div className="fg2"><label className="fl2">Username / Email</label><input className="fi2" placeholder="you@gmail.com" value={emSmtp.user} onChange={e=>setEmSmtp(p=>({...p,user:e.target.value}))}/></div>
                  <div className="fg2"><label className="fl2">Password / App Key</label><input className="fi2" type="password" placeholder="••••••••" value={emSmtp.pass} onChange={e=>setEmSmtp(p=>({...p,pass:e.target.value}))}/></div>
                </div>
                <div className="fg2"><label className="fl2">From Name</label><input className="fi2" placeholder="Your Name — Production Co" value={emSmtp.from} onChange={e=>setEmSmtp(p=>({...p,from:e.target.value}))}/></div>
                <div style={{fontSize:9.5,color:"var(--t3)",marginTop:6}}>Not configured yet? Emails will be simulated. Connect a backend with Nodemailer or SendGrid to send for real.</div>
              </div>}
              <div className="em-row"><label>To</label><input placeholder="email@example.com" value={emTo} onChange={e=>setEmTo(e.target.value)}/></div>
              <div className="em-row"><label>Subject</label><input placeholder="Email subject…" value={emSubj} onChange={e=>setEmSubj(e.target.value)}/></div>
              <div className="em-row" style={{alignItems:"flex-start"}}><label style={{paddingTop:8}}>Body</label><textarea placeholder="Write your email…" value={emBody} onChange={e=>setEmBody(e.target.value)}/></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
                <div style={{display:"flex",gap:6}}>{leads.filter(l=>l.stage!=="closed"&&l.email).slice(0,5).map(l=><button key={l.id} className="btn btn-s" onClick={()=>loadTplToCompose(l)} title={`Load template for ${l.name}`}>{l.name.split(" ")[0]}</button>)}</div>
                <button className="btn btn-p" onClick={sendEmail} disabled={emSending||!emTo.trim()||!emSubj.trim()||!emBody.trim()} style={{opacity:emSending||!emTo.trim()||!emSubj.trim()||!emBody.trim()?0.5:1}}><X t="send" s={12}/> {emSending?"Sending…":"Send Email"}</button>
              </div>
              {emSent&&<div className="em-sent">✓ Email sent successfully to {emTo}</div>}
            </div>
          </>)}
        </>)}

      </main>
    </div>

    {/* ══════════ LEAD MODAL ══════════ */}
    {modal==="lead"&&<div className="mo-bg" onClick={()=>setModal(null)}><div className="mo" onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div className="mo-t">{editLead?"Edit Lead":"Add Lead"}</div><button className="btn btn-s" onClick={()=>setModal(null)}><X t="x" s={12}/></button></div><LeadForm lead={editLead} onSave={saveLead} onDelete={editLead?()=>delLead(editLead.id):null}/></div></div>}

    {/* ══════════ BOOKING MODAL ══════════ */}
    {modal==="booking"&&<div className="mo-bg" onClick={()=>setModal(null)}><div className="mo" onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div className="mo-t">Book a Call</div><button className="btn btn-s" onClick={()=>setModal(null)}><X t="x" s={12}/></button></div><BookingForm onSave={saveNewBk} threads={threads}/></div></div>}

    {/* ══════════ BOOKING DETAIL ══════════ */}
    {bkDetail&&<div className="mo-bg" onClick={()=>setBkDetail(null)}><div className="mo" onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div className="mo-t">{bkDetail.title}</div><button className="btn btn-s" onClick={()=>setBkDetail(null)}><X t="x" s={12}/></button></div>
      <div className="fr2" style={{marginBottom:12}}><div><div className="fl2">Date & Time</div><div style={{fontSize:13,fontWeight:700}}>{fD(bkDetail.date)} at {fT(bkDetail.date)}</div></div><div><div className="fl2">Duration</div><div style={{fontSize:13,fontWeight:700}}>{bkDetail.duration} min</div></div><div><div className="fl2">Contact</div><div style={{fontSize:13,fontWeight:700}}>{bkDetail.contact}</div></div><div><div className="fl2">Email</div><div style={{fontSize:13}}>{bkDetail.email||"—"}</div></div></div>
      <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}><span className="tag" style={{background:(CALL_TYPES[bkDetail.type]?.color||"#888")+"1A",color:CALL_TYPES[bkDetail.type]?.color,fontSize:10,padding:"3px 8px"}}>{CALL_TYPES[bkDetail.type]?.icon} {CALL_TYPES[bkDetail.type]?.label}</span>{bkDetail.category&&TAGS[bkDetail.category]&&<span className="tag" style={{background:TAGS[bkDetail.category].bg,color:TAGS[bkDetail.category].color,fontSize:10,padding:"3px 8px"}}>{TAGS[bkDetail.category].label}</span>}<span className="tag" style={{background:bkDetail.status==="confirmed"?"rgba(52,211,153,.12)":"rgba(251,191,36,.12)",color:bkDetail.status==="confirmed"?"var(--ok)":"var(--warn)",fontSize:10,padding:"3px 8px"}}>{bkDetail.status}</span></div>
      {bkDetail.notes&&<div style={{background:"var(--s2)",border:"1px solid var(--b)",borderRadius:7,padding:10,fontSize:11.5,color:"var(--t2)",lineHeight:1.5,marginBottom:12}}>{bkDetail.notes}</div>}
      <div className="ma2"><button className="btn btn-d" onClick={()=>{setBookings(p=>p.filter(b=>b.id!==bkDetail.id));setBkDetail(null);}}><X t="trash" s={11}/> Cancel</button><button className="btn btn-p" onClick={()=>setBkDetail(null)}>Close</button></div>
    </div></div>}
  </>);
}

// ═══ FORMS ══════════════════════════════════════════════════════════════
function LeadForm({lead:l,onSave,onDelete}){
  const[f,sF]=useState({name:l?.name||"",company:l?.company||"",email:l?.email||"",phone:l?.phone||"",source:l?.source||"manual",category:l?.category||"music_video",stage:l?.stage||"cold",notes:l?.notes||""});
  const u=(k,v)=>sF(p=>({...p,[k]:v}));
  return(<><div className="fr2"><div className="fg2"><label className="fl2">Name</label><input className="fi2" value={f.name} onChange={e=>u("name",e.target.value)} placeholder="Contact name"/></div><div className="fg2"><label className="fl2">Company</label><input className="fi2" value={f.company} onChange={e=>u("company",e.target.value)} placeholder="Company / Artist"/></div></div><div className="fr2"><div className="fg2"><label className="fl2">Email</label><input className="fi2" value={f.email} onChange={e=>u("email",e.target.value)}/></div><div className="fg2"><label className="fl2">Phone</label><input className="fi2" value={f.phone} onChange={e=>u("phone",e.target.value)}/></div></div><div className="fr2"><div className="fg2"><label className="fl2">Source</label><select className="fi2" value={f.source} onChange={e=>u("source",e.target.value)}>{SOURCES.map(s=><option key={s} value={s}>{SRC_L[s]}</option>)}</select></div><div className="fg2"><label className="fl2">Category</label><select className="fi2" value={f.category} onChange={e=>u("category",e.target.value)}>{CATS.map(c=><option key={c} value={c}>{CL[c]}</option>)}</select></div></div><div className="fg2"><label className="fl2">Stage</label><select className="fi2" value={f.stage} onChange={e=>u("stage",e.target.value)}>{STAGES.map(s=><option key={s} value={s}>{SL[s]}</option>)}</select></div><div className="fg2"><label className="fl2">Notes</label><textarea className="fi2" value={f.notes} onChange={e=>u("notes",e.target.value)}/></div><div className="ma2">{onDelete&&<button className="btn btn-d" onClick={onDelete}><X t="trash" s={11}/> Delete</button>}<div style={{flex:1}}/><button className="btn btn-p" onClick={()=>onSave(f)} disabled={!f.name}>{l?"Save":"Add Lead"}</button></div></>);
}

function BookingForm({onSave,threads}){
  const[f,sF]=useState({title:"",contact:"",email:"",phone:"",date:"2026-04-10",time:"10:00",duration:"30",type:"discovery",source:"manual",category:"music_video",notes:"",threadId:""});
  const u=(k,v)=>sF(p=>({...p,[k]:v}));
  const fill=(tid)=>{const t=threads.find(x=>x.id===tid);if(t){u("threadId",tid);u("contact",t.name);u("title",`Discovery Call — ${t.name}`);u("source",t.platform==="ig"?"ig_dm":"fb_dm");}};
  return(<><div className="fg2"><label className="fl2">Link to DM (optional)</label><select className="fi2" value={f.threadId} onChange={e=>{if(e.target.value)fill(e.target.value);else u("threadId","");}}><option value="">Manual booking</option>{threads.map(t=><option key={t.id} value={t.id}>{t.platform==="ig"?"📸":"📘"} {t.name}</option>)}</select></div><div className="fr2"><div className="fg2"><label className="fl2">Title</label><input className="fi2" value={f.title} onChange={e=>u("title",e.target.value)} placeholder="Discovery Call — Name"/></div><div className="fg2"><label className="fl2">Contact</label><input className="fi2" value={f.contact} onChange={e=>u("contact",e.target.value)}/></div></div><div className="fr2"><div className="fg2"><label className="fl2">Email</label><input className="fi2" value={f.email} onChange={e=>u("email",e.target.value)}/></div><div className="fg2"><label className="fl2">Phone</label><input className="fi2" value={f.phone} onChange={e=>u("phone",e.target.value)}/></div></div><div className="fr2"><div className="fg2"><label className="fl2">Date</label><input className="fi2" type="date" value={f.date} onChange={e=>u("date",e.target.value)}/></div><div className="fg2"><label className="fl2">Time</label><input className="fi2" type="time" value={f.time} onChange={e=>u("time",e.target.value)}/></div></div><div className="fr2"><div className="fg2"><label className="fl2">Duration</label><select className="fi2" value={f.duration} onChange={e=>u("duration",e.target.value)}><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div><div className="fg2"><label className="fl2">Call Type</label><select className="fi2" value={f.type} onChange={e=>u("type",e.target.value)}>{Object.entries(CALL_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div></div><div className="fr2"><div className="fg2"><label className="fl2">Source</label><select className="fi2" value={f.source} onChange={e=>u("source",e.target.value)}>{Object.entries(SRC_ICO).map(([k,v])=><option key={k} value={k}>{v} {k.replace(/_/g," ")}</option>)}</select></div><div className="fg2"><label className="fl2">Category</label><select className="fi2" value={f.category} onChange={e=>u("category",e.target.value)}>{Object.entries(TAGS).filter(([k])=>!["hot","booked"].includes(k)).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div></div><div className="fg2"><label className="fl2">Notes</label><textarea className="fi2" value={f.notes} onChange={e=>u("notes",e.target.value)}/></div><div className="ma2"><button className="btn btn-p" onClick={()=>onSave(f)} disabled={!f.title||!f.contact}>Book Call</button></div></>);
}
