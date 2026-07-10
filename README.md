# AlhamdCollection - Premium Clothing E-Commerce Store 🛍️

A professional full-stack online clothing store built with Next.js 14, TypeScript, TailwindCSS, MongoDB, and modern web technologies for selling premium fashion products across Pakistan.

AlhamdCollection provides a complete e-commerce experience with customer accounts, secure authentication, product management, shopping cart, checkout system, payment verification, order management, customer reviews, coupon system, and a powerful admin dashboard.

---

# 🚀 Features

## 👕 Customer Features

### Modern Homepage

- Hero banner slider
- Featured products
- Best sellers section
- Trending collections
- New arrivals
- Product categories
- Newsletter section
- Fully responsive mobile design

---

## 🛒 Shop System

- Browse all products
- Search products
- Category filtering
- Price filtering
- Product sorting
- Stock availability
- Responsive product cards

---

## 📦 Product Details

- Multiple product images
- Product description
- Price details
- Discount pricing
- Stock information
- Related products
- Customer reviews
- Product ratings

---

## 🛍️ Shopping Cart

- Add products to cart
- Update quantity
- Remove products
- Automatic total calculation
- Cart summary

---

## 💳 Checkout System

- Customer information
- Shipping details
- Order summary
- Payment method selection
- Payment screenshot upload
- Order confirmation

Payment Methods:

- Cash on Delivery
- EasyPaisa
- JazzCash

---

# 👤 User Account System

- User registration
- Secure login
- Profile management
- Order history
- Order tracking
- Return requests
- Product reviews

---

# 📦 Order Management

Customers can:

- Place orders
- Track orders
- View order history
- Check order status
- Request returns

Order Status:

```
Pending
Confirmed
Processing
Shipped
Delivered
Cancelled
Returned
```

---

# 🔄 Return System

- Submit return requests
- Add return reasons
- Track return status
- Admin return management

---

# 🎟️ Coupon System

- Apply discount coupons
- Percentage discounts
- Fixed amount discounts
- Coupon expiry management
- Admin coupon control

---

# 🛠️ Admin Dashboard

Complete store management system.

## Dashboard

- Sales overview
- Total revenue
- Total orders
- Total customers
- Total products
- Website analytics

---

## Product Management

Admin can:

- Add products
- Edit products
- Delete products
- Upload product images
- Manage categories
- Update stock
- Manage prices
- Set product status

Product Types:

```
Featured
Best Seller
Trending
New Arrival
```

---

## Order Management

Admin can:

- View all orders
- View customer details
- Update order status
- Verify payments
- Manage returns

---

## Customer Management

- View customers
- Customer profiles
- Order history
- Block customers
- Manage accounts
- Verify users

---

## Payment Management

- View payment screenshots
- Verify payments
- Manage EasyPaisa payments
- Manage JazzCash payments
- Payment settings

---

# 🇵🇰 Pakistan Specific Features

- PKR currency support
- EasyPaisa support
- JazzCash support
- Cash on Delivery
- Pakistan address system
- Local customer experience

---

# 🔐 Authentication & Security

- Secure authentication
- Protected routes
- Admin authorization
- User sessions
- Role-based access control

---

# 🛠️ Tech Stack

## Frontend

- Next.js 14
- React
- TypeScript
- TailwindCSS

## Backend

- Next.js API Routes
- Node.js

## Database

- MongoDB
- Mongoose

## Authentication

- NextAuth.js

## Image Storage

- Cloudinary

## Deployment

- Vercel
- GitHub

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/hsn083/Alhamd-Collection.git
```

## Enter Project Folder

```bash
cd Alhamd-Collection
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔧 Environment Variables

Create `.env.local` file:

```env
MONGODB_URI=

NEXTAUTH_SECRET=

NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_SITE_URL=
```

---

# 📁 Project Structure

```
src/
│
├── app/
│   ├── admin/              # Admin dashboard
│   ├── account/            # Customer account
│   ├── shop/               # Shop pages
│   ├── products/           # Product pages
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout system
│   ├── track-order/        # Order tracking
│   ├── returns/            # Return system
│   └── api/                # Backend APIs
│
├── components/             # Reusable components
├── models/                 # Database models
├── utils/                  # Helper functions
├── public/                 # Images and assets
└── styles/                 # Global styles
```

---

# 🌐 Pages

## Customer Pages

```
/
/shop
/product/[id]
/cart
/checkout
/account
/track-order
/returns
```

## Admin Pages

```
/admin
/admin/products
/admin/orders
/admin/customers
/admin/categories
/admin/coupons
/admin/settings
```

---

# 🚀 Deployment

## Deploy on Vercel

Steps:

1. Push project to GitHub
2. Connect repository with Vercel
3. Add environment variables
4. Deploy project

---

# 📝 Available Scripts

Development:

```bash
npm run dev
```

Production Build:

```bash
npm run build
```

Start Production:

```bash
npm start
```

Code Checking:

```bash
npm run lint
```

---

# 📞 Contact

## AlhamdCollection

Location:

```
ALJANNAT MARKET
ADDA MONGI BANGLA
```

Phone:

```
+923457791198
```

Email:

```
alhamdcollection518@gmail.com
```

---

# 📄 License

This project is developed for AlhamdCollection.

2026. All rights reserved.

---
## 👨‍💻 Created By

Designed and Developed by Hassan Ahmad

---
Built with ❤️ using Next.js, React, TypeScript, MongoDB, and modern web technologies.
