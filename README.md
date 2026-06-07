# 🛒 LekkerList — Mzansi's Marketplace

> A full-stack South African e-commerce marketplace where locals can buy and sell the lekker way.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![PHP](https://img.shields.io/badge/PHP-8-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

---

## 📸 Overview

LekkerList is a feature-rich marketplace web application built for South African buyers and sellers. It supports multiple user roles, real-time messaging, a full checkout flow with VAT, order tracking, seller reports, product reviews, and a multi-tier admin dashboard.

---

## ✨ Features

- 🔐 **Authentication** — Register, login, reset password with role-based access
- 🛍️ **Browse & Search** — Live product search by title, description, seller, or category
- 🏪 **Seller Tools** — Add, edit, delete listings, view sales dashboard and earnings
- 🛒 **Cart & Checkout** — Persistent cart, ZAR pricing, order confirmation
- 📦 **Order Lifecycle** — `paid → processing → shipped → delivered` driven by roles
- 💬 **Order Messaging** — Scoped chat per order between buyer and seller
- ⭐ **Product Reviews** — Star rating + comment, displayed on product cards
- 🚩 **Seller Reports** — Customers can report sellers, super admin reviews them
- 👤 **Profile** — Edit name, email, avatar with live preview
- 🔄 **Role Switch** — Customer ↔ Seller switch from the sidebar
- 🔧 **Admin Dashboard** — Three-tier RBAC: Super Admin, Finance Admin, Content Admin

---

## 🗂️ Project Structure

```
LekkerList/
├── frontend/
│   └── LekkerList-ui/              # React + Vite app (port 5173)
│       ├── public/
│       ├── src/
│       │   ├── actions/            # Redux action creators
│       │   ├── api/                # Axios client (index.js)
│       │   ├── components/         # Reusable components
│       │   │   ├── cart/           # CartProvider, CartDrawer, CartIcon
│       │   │   ├── earnings/       # Earnings overview widget
│       │   │   ├── footer/         # Site footer
│       │   │   ├── header/         # Site header / topbar
│       │   │   ├── hooks/          # useAdminRole.js
│       │   │   ├── orders/         # Orders management component
│       │   │   ├── products/       # Products admin table
│       │   │   ├── roleRoute/      # RoleRoute guard component
│       │   │   ├── searchBar/      # SearchBar with live filtering
│       │   │   ├── sidebar/        # Role-aware sidebar + role switch
│       │   │   ├── statusBubble/   # Order status control component
│       │   │   └── topbar/         # Mobile topbar
│       │   ├── constants/          # Redux action type constants
│       │   ├── emoji/              # PNG emoji assets
│       │   ├── images/             # SVG icons + company logo
│       │   ├── pages/
│       │   │   ├── addProduct/     # Add new listing form
│       │   │   ├── adminDashboard/ # Admin dashboard (RBAC gated)
│       │   │   ├── allMessages/    # Inbox — all conversations
│       │   │   ├── browseProducts/ # Product grid + search + filter
│       │   │   ├── customerDashboard/
│       │   │   ├── dashboard/      # Seller dashboard
│       │   │   ├── home/           # Landing page
│       │   │   ├── myProducts/     # Seller's own listings
│       │   │   ├── orderChat/      # Order-scoped chat + review + report
│       │   │   ├── productForm/
│       │   │   ├── profile/        # Profile view + edit
│       │   │   ├── reviews/        # Public reviews page
│       │   │   ├── transactions/   # Order history
│       │   │   ├── unauthorized/
│       │   │   └── updateProduct/  # Edit listing form
│       │   ├── reducers/           # Redux reducers
│       │   ├── config.js           # API_BASE URL config
│       │   ├── App.jsx             # Routes + layout
│       │   ├── main.jsx            # React entry point
│       │   └── store.js            # Redux store
│       ├── .env                    # Local dev env vars
│       ├── .env.production         # Production env vars
│       ├── package.json
│       └── vite.config.js
│
└── backend/                        # PHP REST API (XAMPP port 80)
    ├── api/
    │   ├── config/
    │   │   └── database.php        # MySQLi connection
    │   ├── permissions.php         # RBAC helper
    │   ├── login.php
    │   ├── register.php
    │   ├── resetpassword.php
    │   ├── profile.php
    │   ├── users.php               # User management + role switch
    │   ├── getProducts.php
    │   ├── createProduct.php
    │   ├── updateProduct.php
    │   ├── deleteProduct.php
    │   ├── getCartProducts.php
    │   ├── processOrder.php
    │   ├── getTransactions.php
    │   ├── updateOrderStatus.php
    │   ├── updateProductStatus.php
    │   ├── getMessages.php
    │   ├── getAllMessages.php
    │   ├── sendMessage.php
    │   ├── submitReview.php
    │   ├── getReviews.php
    │   ├── reportSeller.php
    │   └── getReports.php
    ├── assets/
    │   ├── css/
    │   └── js/
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   └── checkout.html
    └── uploads/                    # User avatar uploads
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| State management | Redux Toolkit + Redux Thunk |
| Routing | React Router v6 |
| UI components | Ant Design 5 |
| HTTP client | Axios |
| Backend | PHP 8 |
| Database | MySQL 8 |
| Local server | XAMPP / Apache |

---

## 📦 NPM Dependencies

### Install all dependencies

```bash
cd frontend/LekkerList-ui
npm install
```

### Core dependencies (`dependencies`)

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.x | UI library |
| `react-dom` | ^18.x | React DOM renderer |
| `react-router-dom` | ^6.x | Client-side routing |
| `redux` | ^5.x | State management |
| `react-redux` | ^9.x | React bindings for Redux |
| `@reduxjs/toolkit` | ^2.x | Redux utilities |
| `redux-thunk` | ^3.x | Async Redux middleware |
| `axios` | ^1.x | HTTP client with interceptors |
| `antd` | ^5.x | Ant Design UI component library |
| `@ant-design/icons` | ^5.x | Ant Design icon set |

### Dev dependencies (`devDependencies`)

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^5.x | Build tool and dev server |
| `@vitejs/plugin-react` | ^4.x | Vite plugin for React |
| `vite-plugin-svgr` | ^4.x | Import SVGs as React components |
| `eslint` | ^8.x | Linting |
| `eslint-plugin-react` | ^7.x | React-specific ESLint rules |
| `eslint-plugin-react-hooks` | ^4.x | Hooks linting rules |

### Install individually if needed

```bash
# Core React
npm install react react-dom

# Routing
npm install react-router-dom

# Redux
npm install redux react-redux @reduxjs/toolkit redux-thunk

# API
npm install axios

# UI
npm install antd @ant-design/icons

# Dev tools
npm install -D vite @vitejs/plugin-react vite-plugin-svgr eslint
```

---

## 🗄️ Database Schema

Tables: `users`, `products`, `orders`, `order_items`, `messages`, `reviews`, `seller_reports`, `order_status_history`

Run this SQL in phpMyAdmin to create all tables:

```sql
CREATE TABLE users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  firstname           VARCHAR(100),
  lastname            VARCHAR(100),
  email               VARCHAR(150) UNIQUE,
  password            VARCHAR(255),
  role                ENUM('customer','seller','admin') DEFAULT 'customer',
  admin_role          ENUM('super_admin','finance_admin','content_admin') NULL,
  image               TEXT,
  is_verified         TINYINT(1) DEFAULT 0,
  verification_status ENUM('Pending','Verified') DEFAULT 'Pending',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id          INT AUTO_INCREMENT PRIMARY KEY,
  seller_id           INT,
  product_title       VARCHAR(255),
  product_description TEXT,
  category_id         ENUM('Car Parts','Electronics','Fashion','Home & Garden','Music','Sport & Fitness'),
  product_image       LONGTEXT,
  product_price       DECIMAL(10,2) DEFAULT 0.00,
  status              ENUM('active','inactive','sold') DEFAULT 'active',
  seller_name         VARCHAR(255),
  avg_rating          DECIMAL(3,2)  DEFAULT 0.00,
  review_count        INT           DEFAULT 0,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_id         INT,
  customer_firstname  VARCHAR(100),
  customer_lastname   VARCHAR(100),
  customer_email      VARCHAR(150),
  customer_phone      VARCHAR(20),
  ship_street         VARCHAR(255),
  ship_suburb         VARCHAR(100),
  ship_city           VARCHAR(100),
  ship_postal         VARCHAR(10),
  ship_province       VARCHAR(100),
  total               DECIMAL(10,2),
  status              VARCHAR(50) DEFAULT 'paid',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT,
  product_id  INT,
  seller_id   INT,
  title       VARCHAR(255),
  price       DECIMAL(10,2),
  qty         INT DEFAULT 1,
  image       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT DEFAULT 0,
  sender_id   INT,
  receiver_id INT,
  message     TEXT,
  is_read     TINYINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  reviewer_id INT NOT NULL,
  seller_id   INT NOT NULL,
  rating      TINYINT NOT NULL DEFAULT 0,
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (order_id, product_id, reviewer_id)
);

CREATE TABLE seller_reports (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  reporter_id      INT NOT NULL,
  reported_user_id INT NOT NULL,
  reason           TEXT NOT NULL,
  status           ENUM('pending','reviewed','dismissed') DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT,
  changed_by INT,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Getting Started

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (PHP 8 + MySQL + Apache)
- [Node.js](https://nodejs.org/) v18+
- npm v9+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/LekkerList.git
cd LekkerList
```

### 2. Set up the backend

```bash
# Copy backend to XAMPP htdocs
cp -r backend/ C:/xampp/htdocs/LekkerList/backend/
```

1. Start **Apache** and **MySQL** in XAMPP Control Panel
2. Open [phpMyAdmin](http://localhost/phpmyadmin)
3. Create a database named `lekkerlist`
4. Run the SQL schema above
5. Update `backend/config/database.php`:

```php
$conn = new mysqli("localhost", "root", "", "lekkerlist");
```

### 3. Set up the frontend

```bash
cd frontend/LekkerList-ui
npm install
```

Create your `.env` file:

```env
VITE_API_BASE=http://localhost/LekkerList/backend/api
```

Start the dev server:

```bash
npm run dev
```

### 4. Access the site

| URL | Purpose |
|---|---|
| `http://localhost:5173/` | React frontend |
| `http://localhost/LekkerList/backend/pages/login.html` | Login page |
| `http://localhost/LekkerList/backend/pages/register.html` | Register page |
| `http://localhost/LekkerList/backend/pages/checkout.html` | Checkout page |

### 5. Create your first Super Admin

Register normally, then run in phpMyAdmin:

```sql
UPDATE users
SET role = 'admin', admin_role = 'super_admin'
WHERE email = 'your@email.com';
```

---

## 👤 User Roles

| Role | Access |
|---|---|
| **Guest** | Browse products, home page |
| **Customer** | Cart, checkout, orders, messages, reviews, reports |
| **Seller** | All customer features + listings, sales dashboard, earnings |
| **Super Admin** | Everything — user management, role assignment, reports |
| **Finance Admin** | Orders, earnings, cancel/refund orders |
| **Content Admin** | Product management — add, edit, delete any listing |

---

## 🔑 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register.php` | Register new user |
| `POST` | `/login.php` | Login + return session token |
| `GET` | `/getProducts.php` | Fetch all products |
| `POST` | `/createProduct.php` | Create listing |
| `PUT` | `/updateProduct.php?id=` | Update listing |
| `DELETE` | `/deleteProduct.php?id=` | Delete listing |
| `POST` | `/processOrder.php` | Place order |
| `POST` | `/updateOrderStatus.php` | Update order status |
| `GET` | `/getTransactions.php` | Fetch orders |
| `GET` | `/getMessages.php` | Fetch order chat |
| `POST` | `/sendMessage.php` | Send message |
| `GET` | `/getAllMessages.php` | Fetch all user messages |
| `POST` | `/submitReview.php` | Submit product review |
| `GET` | `/getReviews.php` | Fetch reviews |
| `POST` | `/reportSeller.php` | Report a seller |
| `GET PATCH` | `/getReports.php` | Admin: get/update reports |
| `GET DELETE PATCH` | `/users.php` | Admin: manage users |
| `GET POST` | `/profile.php` | Get/update user profile |

---

## 🎨 Brand

| Token | Value |
|---|---|
| Primary Orange | `#E8622A` |
| Accent Teal | `#2BBFB3` |
| Background | `#fdf8f4` |
| Dark | `#1a1a1a` |
| Heading font | Syne (700, 800) |
| Body font | DM Sans (400, 500, 600) |

> All colours are written inline — no CSS custom properties are used.

---


---

## 📄 License

This project is for educational and portfolio purposes.

---

Built with ❤️ in South Africa 🇿🇦
