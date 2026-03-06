# Ovn

**A location-based peer-to-peer marketplace for home bakers in the Bay Area.**

🔗 **Live:** [https://ovn-nu.vercel.app](https://ovn-nu.vercel.app)

---

## Overview

Ovn connects home bakers with their local community through listing discovery, map-based search, and in-app messaging. It fills the gap between large commercial food platforms and informal social media exchanges — giving bakers a calm, structured space to share what they've made with people nearby.

---

## Features

- **Authentication** — Email/password signup and login with secure session management
- **Listings** — Create, edit, and delete listings with photos, pricing, categories, and neighborhood location
- **Pinterest-style browse** — 2-column grid with image tiles and typographic cards for listings without photos
- **Map discovery** — Interactive map centered on the Bay Area showing listings by neighborhood
- **Sold listings** — Sellers can mark items as sold; sold badge displayed across listing and profile views
- **Messaging** — Thread-based conversations between buyers and sellers with a full inbox view
- **Star ratings + reviews** — Both buyers and sellers can rate each other after a transaction
- **User profiles** — Display name, bio, profile photo, listings, and reviews in one place
- **Community guide** — Food safety and community guidelines built into the homepage

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — utility-first styling with custom mauve color palette
- **React Leaflet** — map-based listing discovery
- **Playfair Display + DM Sans** — editorial typography

### Backend
- **Supabase** — PostgreSQL database, authentication, and file storage
- **PostGIS** — geospatial indexing for location-based queries
- **Row Level Security** — database-level access control policies

### Infrastructure
- **Vercel** — frontend deployment with automatic GitHub integration
- **Supabase Storage** — image hosting for listings and avatars

---

## Data Model

```
users
  id, email, display_name, bio, avatar_url, created_at

listings
  id, seller_id, title, description, price, is_free,
  is_sold, category, image_url, lat, lng, created_at

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
- **Zip-to-coordinate mapping** — custom Bay Area zip code library maps neighborhood selections to lat/lng for map rendering
- **Dynamic imports** — map component loaded client-side only to avoid SSR issues with Leaflet
- **Singleton Supabase client** — browser client instantiated once and reused across the app to prevent session issues

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
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

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

---

## Potential Next Steps

- Real-time messaging via Supabase Realtime
- Push notifications for new messages
- Listing expiration and auto-archiving
- Redis caching for high-traffic listing queries
- Pagination and infinite scroll
- Mobile app via React Native with shared Supabase backend

---

## Positioning

> Designed and deployed Ovn, a full-stack geospatial peer-to-peer marketplace featuring relational schema design, row-level database access control, map-based discovery, and an integrated messaging and ratings system for localized community exchange.