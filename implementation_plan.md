# Foodsta — Full-Stack Implementation Plan

A mobile-first food discovery platform with short-form video reels, dark cinematic neon UI, JWT authentication, and strict like/save toggle logic.

## User Review Required

> [!IMPORTANT]
> **ImageKit / Cloudinary Credentials**: The upload system requires ImageKit (or Cloudinary) API keys. I'll scaffold the integration with environment variables — you'll need to provide your keys in a `.env` file before upload works.

> [!IMPORTANT]
> **MongoDB Connection**: You'll need a running MongoDB instance (local or Atlas). I'll use `MONGO_URI` from `.env`.

> [!WARNING]
> **TailwindCSS**: The PRD mentions optional Tailwind. The HTML reference uses Tailwind CDN. I'll use **vanilla CSS** with the cinematic design system (dark, glassmorphism, neon glows) as per the web app development guidelines — unless you'd prefer Tailwind. Let me know.

## Open Questions

1. **Video hosting**: Should I use **ImageKit** or **Cloudinary**? I'll default to **ImageKit** based on the PRD.
2. **Sample data**: Should I seed the database with sample food items and demo videos for testing, or leave it empty?
3. **Port preferences**: I'll default to `5173` (Vite frontend) and `5000` (Express backend). Any preference?

---

## Proposed Changes

### Project Structure

```
d:\foodsta_2\
├── client/                     # React (Vite) frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── ReelCard.jsx
│   │   │   ├── ActionBar.jsx
│   │   │   ├── FoodGrid.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Loader.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ReelFeed.jsx
│   │   │   ├── ReelViewer.jsx
│   │   │   ├── SavedPage.jsx
│   │   │   ├── CreateFood.jsx
│   │   │   ├── FoodPartnerProfile.jsx
│   │   │   └── DiscoverPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── FoodPartner.js
│   │   ├── Food.js
│   │   ├── Like.js
│   │   ├── Save.js
│   │   └── Session.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── foodController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── foodRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   └── imagekit.js
│   ├── server.js
│   └── package.json
│
├── .env.example
└── README.md
```

---

### Backend — Database & Config

#### [NEW] server/config/db.js
- MongoDB connection via Mongoose using `MONGO_URI` env var

#### [NEW] server/.env.example
- Template with `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `PORT`

---

### Backend — Models

#### [NEW] server/models/User.js
```js
{ fullName, email (unique), password (bcrypt), createdAt }
```

#### [NEW] server/models/FoodPartner.js
```js
{ name, email (unique), password (bcrypt), phone, address, createdAt }
```

#### [NEW] server/models/Food.js
```js
{ name, video, description, foodPartner (ref), likeCount (default 0), savesCount (default 0), createdAt }
```

#### [NEW] server/models/Like.js
```js
{ user (ref User), food (ref Food) }
// Compound unique index: { user: 1, food: 1 }
```

#### [NEW] server/models/Save.js
```js
{ user (ref User), food (ref Food) }
// Compound unique index: { user: 1, food: 1 }
```

#### [NEW] server/models/Session.js
```js
{ userId (ref), refreshToken, expiresAt (Date, TTL index) }
```

---

### Backend — Authentication

#### [NEW] server/controllers/authController.js
- `registerUser` — bcrypt hash, create User, issue tokens
- `registerFoodPartner` — bcrypt hash, create FoodPartner, issue tokens
- `login` — supports both User and FoodPartner, bcrypt compare, issue JWT access (30 min) + refresh token (stored in Session)
- `refreshToken` — validate refresh token from DB, issue new access token
- `logout` — delete Session record

#### [NEW] server/middleware/auth.js
- `verifyAccessToken` — decode JWT, attach `req.user` (id) and `req.userType` ('User' | 'FoodPartner')
- `requireUser` — reject if `req.userType !== 'User'`
- `requireFoodPartner` — reject if `req.userType !== 'FoodPartner'`

#### [NEW] server/routes/authRoutes.js
- `POST /api/auth/register/user`
- `POST /api/auth/register/food-partner`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

---

### Backend — Food APIs (Core Logic)

#### [NEW] server/controllers/foodController.js

**GET /api/food** — Feed endpoint
```js
// Fetch foods with pagination, populate foodPartner
// For each food: compute isLiked/isSaved by checking Like/Save collections
// Return { foods: [...] } with likeCount, savesCount, isLiked, isSaved
```

**GET /api/food/saved** — Saved foods for current user
```js
// Find all Save docs for user, populate food + foodPartner
```

**GET /api/food/partner/:id** — Foods by a specific food partner
```js
// Find all foods where foodPartner === id
```

**POST /api/food/:id/like** — Toggle like (CRITICAL LOGIC)
```js
const existing = await Like.findOne({ user, food });
if (existing) {
  await Like.deleteOne({ _id: existing._id });
} else {
  await Like.create({ user, food });
}
const likeCount = await Like.countDocuments({ food });
// Update Food.likeCount for caching
await Food.findByIdAndUpdate(food, { likeCount });
return { liked: !existing, likeCount };
```

**POST /api/food/:id/save** — Toggle save (same pattern)
```js
const existing = await Save.findOne({ user, food });
if (existing) {
  await Save.deleteOne({ _id: existing._id });
} else {
  await Save.create({ user, food });
}
const savesCount = await Save.countDocuments({ food });
await Food.findByIdAndUpdate(food, { savesCount });
return { saved: !existing, savesCount };
```

#### [NEW] server/routes/foodRoutes.js
- `GET /api/food` — public (but auth optional for isLiked/isSaved)
- `GET /api/food/saved` — requireUser
- `GET /api/food/partner/:id` — public
- `POST /api/food/:id/like` — requireUser
- `POST /api/food/:id/save` — requireUser

---

### Backend — Upload System

#### [NEW] server/utils/imagekit.js
- Initialize ImageKit SDK with env vars

#### [NEW] server/middleware/upload.js
- Multer middleware for video file handling (memory storage, 100MB limit, video MIME filter)

#### [NEW] server/controllers/uploadController.js
- `createFood` — requireFoodPartner, upload video to ImageKit, create Food document

#### [NEW] server/routes/uploadRoutes.js
- `POST /api/food/create` — multer + requireFoodPartner + createFood

---

### Backend — Server Entry

#### [NEW] server/server.js
- Express setup, CORS, JSON body parser
- Connect MongoDB
- Mount all routes
- Error handling middleware

---

### Frontend — Setup & Config

#### [NEW] client/ (via `npm create vite@latest`)
- React + JavaScript template
- Dependencies: `react-router-dom`, `axios`

#### [NEW] client/vite.config.js
- Proxy `/api` to backend (port 5000)

---

### Frontend — Design System

#### [NEW] client/src/styles/index.css

Core design tokens:
| Token | Value |
|-------|-------|
| `--bg-primary` | `#0e0e0e` |
| `--bg-surface` | `#131313` |
| `--bg-glass` | `rgba(31, 31, 31, 0.6)` |
| `--text-primary` | `#e2e2e2` |
| `--text-secondary` | `#e5bcc4` |
| `--accent-pink` | `#ffb1c3` |
| `--accent-pink-hot` | `#ff4b89` |
| `--accent-cyan` | `#00dbe9` |
| `--accent-purple` | `#bb0058` |
| `--glass-blur` | `24px` |
| `--neon-glow` | `0 0 20px rgba(255, 177, 195, 0.2)` |

Glassmorphism panels, neon button styles, gradient overlays, animations, bottom nav, fullscreen reel layout — all in pure CSS.

---

### Frontend — Auth Context

#### [NEW] client/src/contexts/AuthContext.jsx
- Store user, token, userType in context + localStorage
- `login()`, `register()`, `logout()`, `refreshToken()` methods
- Axios interceptor for auto-attaching Authorization header
- Auto-refresh on 401

---

### Frontend — API Service

#### [NEW] client/src/services/api.js
- Axios instance with base URL `/api`
- Interceptors for auth token
- Functions: `getFeed()`, `toggleLike(id)`, `toggleSave(id)`, `getSavedFoods()`, `getPartnerFoods(id)`, `createFood(formData)`, `login()`, `register()`

---

### Frontend — Pages

#### [NEW] client/src/pages/LoginPage.jsx
- Cinematic login form with glassmorphism card
- Email/password inputs, role selector (User / Food Partner)
- Neon gradient submit button

#### [NEW] client/src/pages/RegisterPage.jsx
- Registration form with role-specific fields
- Food Partner: name, email, password, phone, address
- User: fullName, email, password

#### [NEW] client/src/pages/ReelFeed.jsx (Route: `/app`)
- **Main screen** — fullscreen vertical video reel
- Vertical swipe navigation (touch + scroll)
- Auto-play current video, pause others
- Bottom gradient overlay for text readability
- Food metadata overlay (cuisine badge, name, description, partner name)
- CTA buttons: "View Dish" + "View Restaurant"

#### [NEW] client/src/pages/ReelViewer.jsx (Route: `/reel`)
- Accepts `location.state.videos` + `startIndex` OR fetches from API
- Same reel UI as feed but for specific video sets
- Swipe navigation between videos

#### [NEW] client/src/pages/SavedPage.jsx (Route: `/saved`)
- Grid layout (2 columns, 9:16 aspect ratio thumbnails)
- Click → navigate to ReelViewer with videos + startIndex
- Empty state with animation

#### [NEW] client/src/pages/CreateFood.jsx (Route: `/create-food`)
- Video upload form (drag & drop + file picker)
- Fields: name, description, video file
- Upload progress indicator
- Only accessible to Food Partners

#### [NEW] client/src/pages/FoodPartnerProfile.jsx (Route: `/food-partner/:id`)
- Partner info header
- Video grid (same as saved page layout)
- Click → ReelViewer navigation

#### [NEW] client/src/pages/DiscoverPage.jsx (Route: `/discover`)
- Grid of all foods (explore/browse)
- Search/filter (future enhancement, basic grid for now)

---

### Frontend — Components

#### [NEW] client/src/components/ActionBar.jsx
- Right-side floating action buttons (Like, Save, Share)
- Circular glassmorphism buttons with neon glow
- Animated fill on like/save (heart fills red, bookmark fills cyan)
- Count display below each button
- **RULE**: Counts come from API response only, never incremented locally

#### [NEW] client/src/components/BottomNav.jsx
- Floating glass navigation bar
- Icons: Feed, Discover, Saved, Profile
- Active state with neon glow indicator
- Uses `useLocation()` for active detection

#### [NEW] client/src/components/ReelCard.jsx
- Fullscreen video container
- Gradient overlays (bottom + side)
- Video element with autoplay/muted/loop
- Intersection Observer for play/pause

#### [NEW] client/src/components/FoodGrid.jsx
- Reusable grid for Saved/Profile/Discover pages
- 9:16 aspect ratio video thumbnails
- Hover/tap effects
- Click handler for reel navigation

#### [NEW] client/src/components/ProtectedRoute.jsx
- Wraps routes requiring auth
- Redirects to login if no token
- Optional role check (User vs FoodPartner)

#### [NEW] client/src/components/Loader.jsx
- Animated loading spinner with neon glow

---

### Frontend — App & Routing

#### [NEW] client/src/App.jsx
```
Routes:
  /             → redirect to /app
  /login        → LoginPage
  /register     → RegisterPage
  /app          → ReelFeed (protected)
  /reel         → ReelViewer (protected)
  /saved        → SavedPage (protected, User only)
  /discover     → DiscoverPage
  /create-food  → CreateFood (protected, FoodPartner only)
  /food-partner/:id → FoodPartnerProfile
```

---

## Verification Plan

### Automated Tests

1. **Backend startup**: `node server.js` — verify MongoDB connection and server listen
2. **Auth flow**: Register user → login → verify JWT returned → access protected route
3. **Like toggle**: Like food → verify `liked: true` + count → like again → verify `liked: false` + count decremented
4. **Save toggle**: Same as like
5. **Feed API**: Verify response shape matches contract (`foods[]` with `isLiked`, `isSaved`)
6. **Frontend build**: `npm run build` — no errors

### Manual Verification (Browser)

1. **Reel Feed**: Open `/app`, verify fullscreen video plays, swipe works
2. **Like/Save**: Click like → verify heart fills + count updates from backend
3. **Saved Page**: Save items → navigate to `/saved` → verify grid shows saved items
4. **Upload**: Login as Food Partner → upload video → verify it appears in feed
5. **Profile**: Click food partner name → verify profile page shows their videos
6. **Auth**: Verify login/register/logout flow, protected routes redirect properly
7. **Visual**: Verify dark theme, glassmorphism, neon glows, animations render correctly
