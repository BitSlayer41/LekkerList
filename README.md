# 🛒 LekkerList — Mzansi's Marketplace

> A full-stack South African marketplace where locals can buy and sell products the lekker way.

---

## 📸 Overview

LekkerList is a feature-rich marketplace web application built for South African buyers and sellers. It supports multiple user roles, real-time messaging, a full checkout flow with VAT, order tracking, and an admin dashboard.

---

## ✨ Features

- 🔐 **Authentication** — Register, login, reset password with role-based access (Customer, Seller, Admin)
- 🛍️ **Browse & Search** — Live product search by title, description, seller, or category
- 🏪 **Seller Tools** — Add, edit, and delete product listings with image upload
- 🛒 **Cart & Checkout** — Persistent cart, VAT calculation, card payment form, order confirmation
- 📦 **Orders** — Full order history for customers and sales view for sellers
- 💬 **Messaging** — Order-scoped chat between buyers and sellers with live polling
- 👤 **Profile** — Edit name, email, and avatar with live preview
- 🔧 **Admin Dashboard** — View and delete all users, live user stats by role
- 📊 **Seller Dashboard** — Active listings, items sold, and total earnings overview

---

## 🗂️ Project Structure

```
LekkerList/
├── frontend/
│   └── LekkerList-ui/          # React + Vite frontend (port 5173)
│       └── src/
│           ├── actions/        # Redux action creators
│           ├── components/     # Reusable components (Cart, SearchBar, Topbar...)
│           ├── constants/      # Redux action type constants
│           ├── pages/          # Route-level pages
│           ├── reducers/       # Redux reducers
│           └── images/         # SVG icons and emoji assets
│
└── backend/                    # PHP backend (XAMPP/Apache, port 80)
    ├── api/                    # PHP API endpoints
    ├── assets/
    │   ├── css/                # Vanilla CSS for PHP pages
    │   └── js/                 # Vanilla JS for PHP pages
    ├── config/
    │   └── database.php        # MySQLi connection
    ├── pages/                  # Standalone HTML pages (login, register...)
    └── uploads/                # User-uploaded images
```

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and dev server |
| Redux + Redux Thunk | Global state management |
| React Router v6 | Client-side routing |
| Ant Design | UI component library |
| CSS (no variables) | Custom styling per component |

### Backend
| Technology | Purpose |
|---|---|
| PHP 8 | REST API endpoints |
| MySQL | Database |
| XAMPP / Apache | Local server |
| MySQLi | Database driver |

---

## 🗄️ Database Tables

| Table | Description |
|---|---|
| `users` | Registered users with roles |
| `products` | Product listings with seller info |
| `orders` | Order header with shipping and customer info |
| `order_items` | Individual line items per order |
| `messages` | Order-scoped messages between buyers and sellers |

---

## 🚀 Getting Started

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (PHP 8 + MySQL)
- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/LekkerList.git
cd LekkerList
```

### 2. Set up the backend

1. Copy the `backend/` folder into your XAMPP `htdocs` directory:
   ```
   C:/xampp/htdocs/LekkerList/backend/
   ```

2. Start **Apache** and **MySQL** in XAMPP Control Panel.

3. Open [phpMyAdmin](http://localhost/phpmyadmin) and create a database called `lekkerlist`.

4. Import the schema — create the following tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255),
  role ENUM('customer','seller','admin') DEFAULT 'customer',
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_title VARCHAR(255),
  product_description TEXT,
  category_id VARCHAR(100),
  product_image LONGTEXT,
  product_price DECIMAL(10,2),
  status ENUM('active','inactive','sold') DEFAULT 'active',
  seller_id INT,
  seller_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  customer_firstname VARCHAR(100),
  customer_lastname VARCHAR(100),
  customer_email VARCHAR(150),
  customer_phone VARCHAR(20),
  ship_street VARCHAR(255),
  ship_suburb VARCHAR(100),
  ship_city VARCHAR(100),
  ship_postal VARCHAR(10),
  ship_province VARCHAR(100),
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  seller_id INT,
  title VARCHAR(255),
  price DECIMAL(10,2),
  qty INT DEFAULT 1,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT DEFAULT 0,
  sender_id INT,
  receiver_id INT,
  message TEXT,
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Update `backend/config/database.php` if your MySQL credentials differ from the defaults:

```php
$conn = new mysqli("localhost", "root", "", "lekkerlist");
```

### 3. Set up the frontend

```bash
cd frontend/LekkerList-ui
npm install
npm run dev
```

The React app runs at **http://localhost:5173**

The PHP backend runs at **http://localhost/LekkerList/backend**

---

## 👤 User Roles

| Role | Access |
|---|---|
| **Guest** | Browse products, view home page |
| **Customer** | Browse, cart, checkout, order history, messaging, profile |
| **Seller** | All customer features + add/edit/delete own listings, sales dashboard |
| **Admin** | All seller features + admin dashboard, user management |

To create an **Admin** account, use the admin code `LEKKERLIST-ADMIN-2026` during registration.

---

## 🔑 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register.php` | Register a new user |
| `POST` | `/api/login.php` | Login and receive session token |
| `GET` | `/api/getProducts.php` | Fetch all products |
| `POST` | `/api/createProduct.php` | Create a new listing |
| `PUT` | `/api/updateProduct.php?id=` | Update a listing |
| `DELETE` | `/api/deleteProduct.php?id=` | Delete a listing |
| `POST` | `/api/processOrder.php` | Place an order |
| `GET` | `/api/getTransactions.php` | Fetch orders for a user |
| `GET` | `/api/getMessages.php` | Fetch order chat messages |
| `POST` | `/api/sendMessage.php` | Send a chat message |
| `GET/POST` | `/api/profile.php` | Get or update user profile |
| `GET/DELETE` | `/api/users.php` | Admin: list or delete users |

---

## 🎨 Brand & Design

| Token | Value |
|---|---|
| Primary Orange | `#E8622A` |
| Accent Teal | `#2BBFB3` |
| Background Warm | `#fdf8f4` |
| Dark | `#1a1a1a` |
| Heading Font | Syne (700, 800) |
| Body Font | DM Sans (400, 500, 600) |

> All colours are written inline per selector — no CSS custom properties are used.

---

## 📄 License

This project is for educational and portfolio purposes.

---

<p align="center">Built with ❤️ in South Africa 🇿🇦</p>
