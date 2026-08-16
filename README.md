# 🌿 LUMÉ — Premium Botanical Skincare E-Commerce Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

LUMÉ is a full-stack, production-grade e-commerce web application meticulously designed for modern botanical skincare rituals. Built with a React + TypeScript frontend and a Node.js + Express + MongoDB backend, LUMÉ features JWT authentication with `httpOnly` refresh token rotation, persistent shopping state, real-time product discovery, promo system, mock checkout, and a full-featured, persistent **Admin Analytics Suite**.

---

## ✨ Key Features

### 🛍️ Customer Storefront
* **Editorial Visual Design**: Editorial aesthetic tailored for luxury skincare.
* **Product Catalog & Filtering**: Search, category filters, skin-type filters, price sorting, and instant debounced autocomplete search.
* **Product Discovery & Recommendations**: Dynamic trending products, best sellers, new arrivals, and automatic cross-product recommendations.
* **Wishlist & Cart Management**: Persistent cart drawer, size selection, item stock validation, and promo code redemption (`WELCOME10`, `LUME15`, `GLOW20`).
* **Customer Authentication**: Secure registration, login, profile management, shipping address book, order history, and product reviews.
* **Mock & Stripe Payments**: Complete mock checkout flow supporting instant order creation and inventory reduction.

### 📊 Admin Portal & Analytics Suite (`/admin`)
* **Real MongoDB Analytics**: Zero hardcoded stats — 100% of metrics, KPI trends, line graphs, and tables are computed from real MongoDB aggregations.
* **Period-over-Period KPI Trends**: Displays live period-over-period percentage changes (`+12.4% vs previous period`) for Revenue, Orders, and Average Order Value (AOV).
* **Interactive Sales Time-Series Chart**: Supports metric toggling (`Revenue ($)` vs `Orders (#)`) across 7-day, 30-day, 90-day, and 12-month range filters.
* **Top Products Performance**: Displays units sold, revenue, stock status, and category breakdown with click-through navigation.
* **Dedicated Product Performance Page (`/admin/products/:id/analytics`)**: Single-product views, cart additions, wishlist additions, revenue, conversion rate %, historical sales line chart, and demand level.
* **6-Tab Analytics Suite (`/admin/analytics`)**: Sales, Products, Inventory, Categories, Customers, and Trending analytics tabs with global date range controls.
* **Demo Seeding Engine & On-Demand Reseed**: Pre-loaded with realistic historical demo records and an admin re-seed trigger (`POST /api/admin/demo/reseed`).

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework**: React 18 with Vite
* **Language**: TypeScript
* **Styling**: Vanilla CSS / Tailwind CSS (LUMÉ Editorial Theme)
* **Icons**: Lucide React
* **Router**: React Router v6

### **Backend**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB + Mongoose ODM
* **Authentication**: JWT (JSON Web Tokens) with `httpOnly` Refresh Cookie Rotation & bcryptjs password hashing
* **Test Suite**: Vitest + Supertest

---

## 📁 Repository Structure

```text
lume-skincare-ecommerce/
├── project/                     # Root Frontend Application
│   ├── src/                     # React + TypeScript Source Files
│   │   ├── components/          # Reusable UI Components (Navbar, ProductCard, AdminLayout...)
│   │   ├── context/             # React Context Providers (AuthContext, CartContext, WishlistContext)
│   │   ├── lib/                 # API Client & Services (apiClient, adminApi, productApi...)
│   │   ├── pages/               # Page Views (HomePage, ShopPage, ProductPage, AdminDashboard...)
│   │   ├── types/               # TypeScript Interface & Type Definitions
│   │   ├── App.tsx              # Application Routes & Provider Assembly
│   │   └── main.tsx             # Entry Point
│   ├── .env.example             # Frontend Environment Variables Template
│   ├── index.html               # Main HTML Template
│   ├── package.json             # Frontend Dependencies & Scripts
│   ├── tsconfig.json            # TypeScript Compiler Configuration
│   └── vite.config.ts           # Vite Build Configuration
│
└── server/                      # Node.js + Express Backend API
    ├── src/
    │   ├── config/              # Database (db.js) & Environment Setup (env.js)
    │   ├── controllers/         # Express Controllers (auth, products, orders, admin, reviews...)
    │   ├── middleware/          # Security Middleware (authenticate, requireAdmin, errorHandler...)
    │   ├── models/              # Mongoose Data Schemas (User, Product, Order, Review, ProductEvent...)
    │   ├── routes/              # Express API Route Handlers (/api/auth, /api/products, /api/admin...)
    │   ├── scripts/             # Seeding Scripts (seedDemoData.js, seedRunner.js)
    │   └── server.js            # Express Server Bootstrap
    ├── tests/                   # Backend Vitest Automated Test Suite (api.test.js)
    ├── .env.example             # Backend Environment Variables Template
    └── package.json             # Backend Dependencies & Test Configuration
```

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env` in both `server/` and `project/` directories:

### **Backend Configuration (`server/.env`)**
```env
NODE_ENV=development
PORT=5000

# MongoDB Connection String (Atlas Cloud URI or Local Instance)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lume?retryWrites=true&w=majority

CLIENT_URL=http://localhost:5173

# Security Secrets (Must be 32+ character strings)
ACCESS_TOKEN_SECRET=lume_jwt_access_token_secret_key_production_32chars
REFRESH_TOKEN_SECRET=lume_jwt_refresh_token_secret_key_production_32chars

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Payment Mode
PAYMENT_MODE=mock

# Seed Admin Credentials
SEED_ADMIN_EMAIL=admin@lumeskincare.com
SEED_ADMIN_PASSWORD=AdminPassword123!
```

### **Frontend Configuration (`project/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started Locally

### **1. Clone Repository & Install Dependencies**
```bash
git clone https://github.com/pk7745/lume-skincare-ecommerce.git
cd lume-skincare-ecommerce

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd server
npm install
cd ..
```

### **2. Seed Database with Idempotent Demo Data**
```bash
cd server
npm run seed:demo
cd ..
```
*This command generates ~100 historical orders over 12 months, ~26,000 product interaction events, 33 customer reviews, and 25 demo customers.*

### **3. Start Development Servers**

**Terminal 1 — Backend Express Server (Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend Vite Application (Port 5173):**
```bash
npm run dev
```

* Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Credentials for Testing

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin@lumeskincare.com` | `AdminPassword123!` | Full Admin Portal & Analytics Access (`/admin`) |
| 🛍️ **Customer** | `customer@example.com` | `CustomerPassword123!` | Customer Storefront Checkout & Order History |

---

## 🧪 Testing & Build Verification

### **Run Backend Vitest Test Suite**
```bash
cd server
npm test
```
*Runs 23 automated end-to-end API tests covering authentication, search autocomplete, order placement, analytics aggregations, and authorization rules.*

### **Run Frontend TypeScript Typecheck**
```bash
npm run typecheck
```

### **Build Production Bundle**
```bash
npm run build
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
