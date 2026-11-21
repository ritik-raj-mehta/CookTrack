# 🍳 CookTrack MERN — Smart Kitchen & Pantry Management System

CookTrack is a modern, collaborative kitchen inventory, pantry tracking, and grocery planning application built on the **MERN** stack (MongoDB, Express, React 19, Node.js) with TypeScript, Redux Toolkit, and Tailwind CSS.

It empowers households, shared apartments, and culinary teams to manage inventory in real time, track expiration dates, eliminate food waste, and coordinate grocery shopping collaboratively.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Models](#-database-models)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Comprehensive Feature Roadmap (What to Add Next)](#-comprehensive-feature-roadmap-what-to-add-next)
  - [Tier 1: High-Impact Core Extensions](#tier-1-high-impact-core-extensions)
  - [Tier 2: Real-Time Sync & Multi-Kitchen](#tier-2-real-time-sync--multi-kitchen)
  - [Tier 3: AI Assistant & Grocery Budgeting](#tier-3-ai-assistant--grocery-budgeting)
  - [Tier 4: UX & Production Hardening](#tier-4-ux--production-hardening)

---

## 🔭 Overview & Architecture

CookTrack utilizes a multi-tenant kitchen model:

```
                  ┌───────────────────────────────┐
                  │    React 19 + TypeScript      │
                  │   Vite + Tailwind + Redux     │
                  └───────────────┬───────────────┘
                                  │ HTTP / REST (withCredentials)
                                  ▼
                  ┌───────────────────────────────┐
                  │   Node.js + Express Server    │
                  │   JWT in HTTP-only Cookie     │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│  MongoDB Atlas   │                              │    Nodemailer    │
│  (Mongoose ODM)  │                              │  (OTP Mailer)    │
└──────────────────┘                              └──────────────────┘
```

1. **Dual Onboarding Paths**: Users can either **Create a Kitchen** (becoming a `KitchenAdmin` with an auto-generated 6-character code) or **Join an Existing Kitchen** using an invite code.
2. **Email OTP Verification**: Temporary signups are cached in MongoDB with a TTL (Time-To-Live) index. Users only get provisioned upon valid 6-digit email OTP verification.
3. **Session Management**: Authenticated with JSON Web Tokens (JWT) stored in HTTP-only, secure cookies, alongside client-side state hydration via Redux Persist.

---

## ✨ Key Features

### 🔐 1. Authentication & Kitchen Access
- **Secure Signup**: Name, email, mobile number, and password validation (8–20 chars).
- **Email OTP Verification**: 6-digit one-time passcode sent via Nodemailer with a 10-minute validity window.
- **Role-Based Permissions**: Distinct capabilities for `KitchenAdmin` and standard `User`.
- **Protected Routes**: Client-side authentication guard with session validation (`/api/auth/me`).

### 📦 2. Pantry & Inventory Management
- **Detailed Item Metadata**: Track product name, category, quantity, unit (kg, g, L, pcs, etc.), storage location (Fridge, Freezer, Pantry), expiry date, and custom notes.
- **Dynamic Stock Badges**:
  - 🟢 **In Stock**: Quantity > 2
  - 🔴 **Low Stock**: Quantity $\le 2$
  - ⚪ **Out of Stock**: Quantity = 0
- **Real-Time Filtering & Search**: Instant search by item title, category dropdown filter, and unit filter.
- **Interactive Modals**: Seamless update modal and delete confirmation popup.

### 🛒 3. Collaborative Grocery List (Shopping Cart)
- **Shared Kitchen List**: All members in the same kitchen share a live shopping cart.
- **Purchase Toggle**: Mark items as bought or pending with a single click.
- **Filter Status**: View all items, only pending purchases, or completed purchases.
- **PDF Export**: Generate and download formatted, printable grocery shopping lists powered by `jspdf`.

### 📊 4. Live Kitchen Dashboard
- **Quick Metrics**: Real-time totals for items in stock, low-stock warnings, products expiring within 7 days, and items added this week.
- **Invite Code Sharing**: 1-click clipboard copy of the 6-character kitchen code to invite family or roommates.
- **Recent Inventory Activity**: List view of the last 10 added items with relative time formatting (*"Added today"*, *"Added 2 days ago"*).

### 👥 5. Kitchen Members & Administration
- **Member Directory**: View all users belonging to the kitchen with avatar badges and roles.
- **Admin Promotion**: Kitchen Admins can promote other members to `KitchenAdmin`.
- **Destructive Actions Safeguards**: Removing members or deleting the entire kitchen requires the Admin's password AND registered phone number verification.
- **Self-Service Exit**: Members can leave a kitchen with password verification, cleanly purging their credentials.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite, ESLint
- **Styling**: Tailwind CSS v4, Ant Design (`antd`)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`), Redux Persist
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: React Icons (`react-icons` - FontAwesome, Feather, Material Design, Lucide)
- **Utilities**: `axios`, `jspdf`, `js-cookie`, `jwt-decode`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`), `cookie-parser`, `bcrypt`
- **Email Service**: Nodemailer
- **CORS**: Configured with credentials support for multiple dev origins

---

## 📁 Project Directory Structure

```
CookTrack Mern/
├── client/                               # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── assets/                       # Static media (kitchen-hero.jpg)
│   │   ├── components/
│   │   │   ├── Header.tsx                # Landing page navigation
│   │   │   ├── ItemCard.tsx              # Inventory product card (badges, edit/delete)
│   │   │   ├── NavBar.tsx                # Collapsible dashboard sidebar
│   │   │   ├── OtpVerificationModal.tsx  # 6-digit verification code dialog
│   │   │   └── ProtectedRoute.tsx        # Route authorization guard
│   │   ├── pages/
│   │   │   ├── Home.tsx                  # Public hero page with CTA
│   │   │   ├── SignIn.tsx                # User login page
│   │   │   ├── SignUp.tsx                # Kitchen creation & admin signup
│   │   │   ├── RegisterToKitchen.tsx     # Join existing kitchen via code
│   │   │   ├── Dashboard.tsx             # Kitchen Hub: metrics & recent items
│   │   │   ├── KitchenItem.tsx           # Pantry: stock view, filters & search
│   │   │   ├── AddItemsToKitchen.tsx     # Restock: add new pantry items
│   │   │   ├── AddItemsToShoppingCart.tsx# Market List: collaborative shopping & PDF export
│   │   │   ├── KitchenInsights.tsx       # Insights: food waste analytics, money saved & trends
│   │   │   └── KitchenMembers.tsx        # Kitchen Crew: team management & permissions
│   │   ├── stores/
│   │   │   ├── store.tsx                 # Redux store & persist configuration
│   │   │   └── slices/
│   │   │       ├── AuthSlice.tsx         # Auth thunks & state reducers
│   │   │       └── KitchenSlice.tsx      # Inventory & shopping cart state
│   │   ├── types/
│   │   │   ├── AuthTypes.ts              # User & credentials interfaces
│   │   │   └── KitchenTypes.ts           # Item, shopping & kitchen schemas
│   │   ├── App.tsx                       # React Router routing configuration
│   │   ├── main.tsx                      # Root mount with Redux Provider
│   │   └── index.css                     # Tailwind styling & animations
│   ├── .env                              # Frontend environment config
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── server/                               # Backend Express API Server
    ├── src/
    │   ├── config/
    │   │   ├── db.js                     # Mongoose connection logic
    │   │   └── emailService.js           # Nodemailer transport & email styling
    │   ├── controllers/
    │   │   ├── authController.js         # Signup, OTP verify, login, logout, getMe
    │   │   └── kitchenController.js      # Items, shopping, members, leave/delete
    │   ├── middleware/
    │   │   └── auth.js                   # JWT cookie/header extraction & validation
    │   ├── models/
    │   │   ├── User.js                   # User credentials, role, kitchenId
    │   │   ├── Kitchen.js                # Kitchen entity with member and item refs
    │   │   ├── KitchenItem.js            # Pantry item schema
    │   │   ├── ShoppingItem.js           # Grocery list item schema
    │   │   └── Otp.js                    # Temporary signup data with TTL index
    │   ├── routes/
    │   │   ├── auth.js                   # Express router for /api/auth
    │   │   └── kitchen.js                # Express router for /api/kitchen
    │   └── server.js                     # Express app setup, CORS, and error handlers
    ├── .env                              # Server environment secrets
    └── package.json
```

---

## 🗄️ Database Models

### 1. `User`
| Field | Type | Description |
|---|---|---|
| `userName` | String | Full name of the user |
| `userEmail` | String (Unique) | Primary login email |
| `userPassword` | String | Bcrypt-hashed password |
| `phoneNumber` | String | Mobile number (used for critical authorization) |
| `role` | String | `'KitchenAdmin'` or `'User'` |
| `kitchenId` | String | 6-character alphanumeric kitchen code |
| `kitchenName` | String | Display name of the kitchen |

### 2. `Kitchen`
| Field | Type | Description |
|---|---|---|
| `kitchenName` | String | Name of the kitchen |
| `kitchenId` | String (Unique) | 6-character invite code |
| `createdBy` | String | User ID / email of creator |
| `members` | Array\<String\> | List of member user IDs |
| `kitchenItemIds` | Array\<ObjectId\> | References to `KitchenItem` |
| `kitchenShoppingItemIds` | Array\<ObjectId\> | References to `ShoppingItem` |

### 3. `KitchenItem`
| Field | Type | Description |
|---|---|---|
| `kitchenId` | String | Associated kitchen ID |
| `productName` | String | Name of the food/pantry item |
| `category` | String | Category (Pantry, Dairy, Produce, etc.) |
| `quantity` | Number | Current stock count |
| `unit` | String | Measurement unit (kg, g, L, pcs, etc.) |
| `storageLocation` | String | Storage area (Fridge, Freezer, Pantry) |
| `expiryDate` | String | Expiration date string |
| `notes` | String | Optional notes or instructions |

### 4. `ShoppingItem`
| Field | Type | Description |
|---|---|---|
| `kitchenId` | String | Associated kitchen ID |
| `name` | String | Name of the item needed |
| `neededQuantity` | Number | Quantity to buy |
| `unit` | String | Measurement unit |
| `notes` | String | Notes / brand preferences |
| `isBought` | Boolean | Completed status (default: `false`) |

### 5. `Otp`
| Field | Type | Description |
|---|---|---|
| `email` | String | Target user email |
| `otp` | String | 6-digit numeric verification code |
| `signupData` | Object | Pending signup payload (`userName`, `userPassword`, `kitchenId`, etc.) |
| `expiresAt` | Date (TTL: 0) | Auto-deleted by MongoDB once expired |

---

## 🔌 API Endpoints Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/register` | No | Initiates Admin signup & emails OTP |
| `POST` | `/api/auth/registerToKitchen` | No | Initiates Member signup to join kitchen & emails OTP |
| `POST` | `/api/auth/verify-otp` | No | Verifies OTP code, provisions account & returns JWT |
| `POST` | `/api/auth/resend-otp` | No | Generates & re-sends a new OTP code |
| `POST` | `/api/auth/login` | No | Validates credentials, sets Access + Refresh cookies |
| `POST` | `/api/auth/refresh-token` | No (Cookie) | Refreshes short-lived Access Token using Refresh Token |
| `GET` | `/api/auth/me` | **Yes** | Validates current session and returns user profile |
| `POST` | `/api/auth/logout` | No | Clears authentication cookie |

### Kitchen Routes (`/api/kitchen`)
| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `GET` | `/api/kitchen/kitchen/:kitchenId/:Id` | **Yes** | Fetches kitchen details & populated items |
| `GET` | `/api/kitchen/kitchenItems/:kitchenId` | **Yes** | Returns all inventory items in a kitchen |
| `POST` | `/api/kitchen/addItems/:kitchenId` | **Yes** | Adds a new inventory product |
| `PUT` | `/api/kitchen/kitchen/:kitchenId/item/:itemId` | **Yes** | Updates an inventory item |
| `DELETE` | `/api/kitchen/kitchen/:kitchenId/item/:itemId` | **Yes** | Deletes an inventory item |
| `GET` | `/api/kitchen/shoppingItems/:kitchenId` | **Yes** | Returns all grocery shopping items |
| `POST` | `/api/kitchen/addShoppingItems/:kitchenId` | **Yes** | Adds item to shopping list |
| `PATCH` | `/api/kitchen/shoppingItem/:kitchenId/:itemId/toggle` | **Yes** | Toggles item between bought & pending |
| `DELETE` | `/api/kitchen/shoppingItem/:kitchenId/:itemId` | **Yes** | Removes item from shopping list |
| `GET` | `/api/kitchen/members/:kitchenId` | **Yes** | Returns all members in the kitchen |
| `PATCH` | `/api/kitchen/makeAdmin/:kitchenId/:targetUserId` | **Yes (Admin)** | Promotes member to KitchenAdmin |
| `DELETE` | `/api/kitchen/removeMember/:kitchenId/:targetUserId` | **Yes (Admin)** | Removes member (requires Admin password + phone) |
| `DELETE` | `/api/kitchen/deleteKitchen/:kitchenId` | **Yes (Admin)** | Deletes entire kitchen (requires Admin password + phone) |
| `POST` | `/api/kitchen/leave/:kitchenId` | **Yes** | Member exits kitchen (requires user password) |
| `GET` | `/api/kitchen/analytics/:kitchenId` | **Yes** | Aggregated food waste, financial impact, and 6-month trends |
| `POST` | `/api/kitchen/item-action/:kitchenId/:itemId` | **Yes** | Logs item consumption (🍽️) or food waste (🗑️) |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas URI)
- An SMTP email account (e.g., Gmail App Password) for Nodemailer OTP delivery

---

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
# MongoDB Atlas Connection String or local instance
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/CookTrack?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_change_me
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_change_me
JWT_ACCESS_EXPIRES_MINUTES=15
JWT_REFRESH_EXPIRES_DAYS=7
CLIENT_URL=http://localhost:5173

# Email OTP settings (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

Start the backend in development mode:

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🗺️ Comprehensive Feature Roadmap (What to Add Next)

Here are the highest-impact enhancements you can build next, ranked by user value:

### Tier 1: High-Impact Core Extensions

1. **"What Can I Cook Right Now?" (Smart Recipe Matcher)**
   - Compare in-stock pantry items with a recipe database (or Spoonacular / Edamam API).
   - Display recipes where the kitchen already has $\ge 80\%$ of ingredients in stock.
   - Show missing ingredients with a 1-click **"Add to Shopping List"** button.

2. **Bidirectional Stock $\leftrightarrow$ Shopping List Workflow**
   - **Out-of-Stock Transfer**: Add an *"Add to Shopping List"* button directly inside `ItemCard.tsx` when an item hits low or zero stock.
   - **Restock on Purchase**: When a shopping item is marked `isBought`, show a quick prompt: *"Add back to Pantry?"* with an expiry date selector.

3. **Automated Expiry Alerts & Daily Email Digest**
   - Add a scheduled background cron job using `node-cron`.
   - Scan for items expiring within 1–3 days and send an automated morning notification email to all kitchen members.

4. **Barcode & Receipt Scanning via Device Camera**
   - Integrate `@zxing/library` or `html5-qrcode` into `AddItemsToKitchen.tsx`.
   - Scan UPC barcodes and auto-fetch product name, category, and image using the free **Open Food Facts API**.

---

### Tier 2: Real-Time Sync & Multi-Kitchen

5. **Live Shopping List Synchronization (`Socket.io`)**
   - Broadcast shopping cart updates in real time so when someone at the grocery store checks off an item, it updates immediately for everyone at home without refreshing.

6. **Multi-Kitchen Switching per User**
   - Refactor `kitchenId` into an array of memberships (`kitchens: [{ kitchenId, role }]`).
   - Add a kitchen switcher dropdown in the navigation bar (e.g., switch between "Home", "Office Pantry", or "Hostel").

7. **Weekly Meal Planner Calendar**
   - A 7-day visual planner (Breakfast, Lunch, Dinner, Snacks).
   - Linking planned meals to inventory so ingredients can be reserved or deducted automatically.

---

### Tier 3: AI Assistant & Grocery Budgeting

8. **AI Leftover Chef (Gemini API Integration)**
   - Add an *"Ask AI Chef"* button on the dashboard.
   - Sends items near expiry to the Gemini API to produce creative, waste-reducing recipes.

9. **Grocery Expense & Budget Analytics**
   - Add `price` and `store` fields to `ShoppingItem`.
   - Render monthly spending charts by category (Dairy, Produce, Pantry) using Chart.js or Recharts.

10. **Kitchen Activity Log & Audit Trail**
    - A shared activity stream showing who added, updated, consumed, or purchased items.

---

### Tier 4: UX & Production Hardening

11. **PWA (Progressive Web App) Installation**
    - Add a web manifest and service worker via `vite-plugin-pwa` so users can install CookTrack as a native app on iOS/Android.

12. **Dark Mode & Theming**
    - Add a theme toggle in the navbar with Tailwind dark classes and smooth color transitions.

13. **Input Validation & API Security**
    - Add `zod` schema validation for all incoming controller payloads.
    - Add `express-rate-limit` to protect OTP generation and login endpoints.

14. **Containerization (Docker)**
    - Add a `docker-compose.yml` to spin up MongoDB, the Express backend, and the React frontend with a single command (`docker compose up --build`).

---

## 📄 License

This project is licensed under the ISC License.

