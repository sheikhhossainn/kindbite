# <img src="./public/logo.svg" width="45" style="vertical-align: bottom;" /> KindBite

**A hyper-local food rescue network that connects people who see hunger with people who can help — in real time.**

KindBite is a Progressive Web App (PWA) that lets anyone "spot" someone in need and pin their location on a live map. Nearby donors get instant notifications and can navigate to the spot to deliver food — all verified with photo proof.

---

## How It Works

| Role | What You Do |
|------|------------|
| **🔍 Spotter** | See someone who looks hungry? Switch to Spotter mode, tap the map to drop a pin with a description. Nearby donors are notified instantly. |
| **🤝 Donor** | See a pin on the map? Lock it, follow the blue route, and deliver food. Take a photo when you arrive to complete the rescue. |
| **🛡️ Admin** | Review proof photos, manage users, and issue trust score penalties for misuse. |

## Key Features

- **📍 Live Map** — Real-time pins with color-coded status (🟢 open, 🔴 yours, ⚫ locked)
- **⚡ Instant Notifications** — Supabase Realtime + sound alerts + browser push notifications
- **📸 Photo Verification** — GPS-gated camera with square viewfinder for food-only proof shots
- **🛡️ Trust Score System** — Anti-fraud detection, self-claim prevention, and admin penalties
- **🗺️ Turn-by-Turn Routing** — Donors get the shortest route to the pin location
- **📱 PWA** — Installable on any phone or desktop, works offline

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth, Database, Realtime, Storage)
- **Maps:** Leaflet + React Leaflet + Leaflet Routing Machine
- **Geospatial:** PostGIS

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Clone the repo
git clone https://github.com/sheikhhossainn/kindbite.git
cd kindbite

# Install dependencies
npm install

# Add your Supabase credentials
# Create a .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run the database setup
# Copy supabase/pins.sql into your Supabase SQL Editor and execute

# Start the dev server
npm run dev
```

### Supabase Setup

1. Run `supabase/pins.sql` in the SQL Editor (creates tables, triggers, and functions)
2. Enable **Realtime** for `pins` and `notifications` tables (Database → Publications → `supabase_realtime`)
3. Create a **Storage bucket** called `proof-photos` (public, 2MB max)
4. Enable **Leaked Password Protection** (Authentication → Settings)

## License

MIT

---

<p align="center">
  <strong>Built with ❤️ to fight hunger, one pin at a time.</strong>
</p>
