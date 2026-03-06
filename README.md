# Ovn

**A location-based peer-to-peer marketplace for home bakers in the Bay Area.**

🔗 **Live:** [https://ovn-nu.vercel.app](https://ovn-nu.vercel.app)

---

## The Story

It started with a TikTok video — a girl using Hinge, a dating app, to share her homemade sourdough loaves with strangers because she had nowhere else to post them. That image stuck with me. She wasn't looking for a date. She just wanted to share something she'd made with people nearby.

I'm a baking enthusiast myself. I know the feeling of pulling something out of the oven and wanting the whole neighborhood to smell it. That moment when butter fills the air of your entire house — it deserves to be shared, not just posted into the void of a general marketplace or buried in a dating app DM.

San Francisco and the Bay Area felt like the natural home for this. The region has one of the most vibrant food cultures in the country, with a deep tradition of artisan baking — from sourdough born in the Gold Rush to the world-class pastry shops that line its neighborhoods today. There's already a community here. Ovn just gives it a place to live.

---

## Overview

Ovn connects home bakers with their local community through listing discovery, map-based search, and in-app messaging. It fills the gap between large commercial food platforms and informal social media exchanges — giving bakers a calm, structured space to share what they've made with people nearby.

---

## Features

- **Authentication** — Email/password signup and login with secure session management
- **Listings** — Create, edit, and delete listings with photos, pricing, categories, and neighborhood location
- **Allergen disclosure** — Bakers can tag preset allergens (gluten, dairy, eggs, nuts, peanuts, soy, sesame) and add custom ones; displayed prominently on listing detail pages
- **Pinterest-style browse** — 2-column grid with image tiles and typographic cards for listings without photos; pastel color variants for imageless tiles
- **Category filters** — Filter listings by bread, pastry, cake, cookies, or other
- **Map discovery** — Interactive Mapbox map centered on the Bay Area with custom mauve price pill markers per listing
- **Sold listings** — Sellers can mark items as sold; sold badge and dimmed tile displayed across listing and profile views
- **Messaging** — Thread-based conversations between buyers and sellers with a full inbox view
- **Star ratings + reviews** — Both buyers and sellers can rate each other after a transaction; average rating displayed on profiles
- **User profiles** — Display name, bio, profile photo, listings grid, and reviews all in one place
- **Community guide** — Food safety and community guidelines built into the homepage

---

## Tech Stack

### Frontend
- **Next.js** (App Router, TypeScript)
- **Tailwind CSS** — utility-first styling with custom mauve color palette
- **React Leaflet + Mapbox** — map-based listing discovery with custom styled tiles
- **Playfair Display + DM Sans** — editorial typography pairing

### Backend
- **Supabase** — PostgreSQL database, authentication, and file storage
- **PostGIS** — geospatial indexing for location-based queries
- **Row Level Security** — database-level access control policies

### Infrastructure
- **Vercel** — frontend deployment with automatic GitHub integration
- **Supabase Storage** — image hosting for listings and avatars
- **Mapbox** — map tile rendering

---

## Data Model

```
users
  id, email, display_name, bio, avatar_url, created_at

listings
  id, seller_id, title, description, price, is_free,
  is_sold, category, allergens[], image_url, lat, lng, created_at

threads
  id, listing_id, buyer_id, seller_id, last_message_at
  → unique(listing_id, buyer_id)

messages
  id, thread_id, sender_id, body, created_at

ratings
  id, thread_id, reviewer_id, reviewee_id, stars, review, created_at
  → unique(thread_id, reviewer_id)
```

---

## Engineering Highlights

- **Row Level Security** enforced at the database level — users can only read and write their own data, thread participants can only access their own messages
- **Thread deduplication** — a unique constraint on `(listing_id, buyer_id)` prevents duplicate conversation threads
- **Geospatial indexing** — `GIST` index on the location column for efficient radius-based queries
- **Zip-to-coordinate mapping** — custom Bay Area zip code library maps 50+ neighborhood selections to lat/lng for map rendering
- **Dynamic imports** — map component loaded client-side only to avoid SSR issues with Leaflet
- **Singleton Supabase client** — browser client instantiated once and reused across the app to prevent session issues
- **Allergen array column** — PostgreSQL `text[]` array type stores multiple allergens per listing with preset + custom input support
- **Mapbox tiles via Leaflet** — Mapbox's light-v11 style rendered through React Leaflet's TileLayer, avoiding the TypeScript-incompatible Mapbox GL JS library entirely

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ovn.git
cd ovn

# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_MAPBOX_TOKEN

# Run locally
npm run dev
```

---

## Tradeoffs & Decisions

| Decision | Rationale |
|----------|-----------|
| Zip code vs GPS location | More privacy-friendly and intuitive for users; avoids browser permission friction |
| Polling vs WebSockets for messaging | Reduced scope for MVP; structured for real-time upgrade via Supabase Realtime |
| Supabase over custom backend | Faster iteration; built-in auth, RLS, and storage without managing infrastructure |
| Bay Area only | Intentional scope constraint to maintain hyperlocal focus and simplify location logic |
| Leaflet + Mapbox tiles vs Mapbox GL JS | Mapbox GL JS introduced TypeScript incompatibilities on build; Leaflet with Mapbox tile URLs achieves the same visual result without the dependency issues |
| PostgreSQL array for allergens | Simpler than a separate allergens table for MVP; structured for normalization if allergen filtering becomes a feature |

---

## Potential Next Steps

- Real-time messaging via Supabase Realtime
- Push notifications for new messages
- Search and filter by neighborhood or keyword
- Listing expiration and auto-archiving
- Favorites / saved listings
- Redis caching for high-traffic listing queries
- Pagination and infinite scroll
- Mobile app via React Native with shared Supabase backend

---

## Positioning

> Designed and deployed Ovn, a full-stack geospatial peer-to-peer marketplace featuring relational schema design, row-level database access control, allergen disclosure, map-based discovery with custom markers, and an integrated messaging and ratings system for localized community exchange.