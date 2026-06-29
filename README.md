# AlhamdCollection - Premium Clothing E-Commerce Store 🛍️

A professional online clothing store built with Next.js, TypeScript, TailwindCSS, MongoDB, and modern web technologies for selling fashion products across Pakistan.

AlhamdCollection provides a complete shopping experience with customer accounts, product management, secure authentication, online ordering, payment verification, and a powerful admin dashboard.

## 🚀 Features

### Customer Features

- **Modern Home Page** with:
  - Hero section
  - Featured products
  - Categories
  - Latest collections
  - Newsletter section

- **Shop Page** with:
  - Product browsing
  - Category filtering
  - Search system
  - Price filtering
  - Product sorting

- **Product Detail Page** with:
  - Multiple product images
  - Product information
  - Price details
  - Stock availability
  - Related products

- **Shopping Cart**
  - Add products to cart
  - Update quantity
  - Remove items
  - Cart total calculation

- **Checkout System**
  - Customer information
  - Shipping details
  - Order summary
  - Payment selection

- **User Account**
  - User registration
  - Secure login
  - Profile management
  - Order history
  - Order tracking

- **Order System**
  - Place orders
  - Track orders
  - View order status
  - Order history

- **Return System**
  - Submit return requests
  - Manage return status

- **Coupon System**
  - Apply discount coupons
  - Percentage and fixed discounts

---

## 🛠️ Admin Panel

### Dashboard

- Sales overview
- Total customers
- Total products
- Total orders
- Website statistics

### Product Management

- Add products
- Edit products
- Delete products
- Upload product images
- Manage categories
- Update stock
- Manage pricing

### Order Management

- View all orders
- Update order status

Order statuses:

```
Pending
Confirmed
Processing
Shipped
Delivered
Cancelled
Returned
```

### Customer Management

- View customers
- Customer details
- Block customers
- Verify customers
- Manage accounts

### Payment Management

- View payment screenshots
- Verify payments
- Manage EasyPaisa/JazzCash orders

---

## 🇵🇰 Pakistan Specific Features

- PKR currency support
- EasyPaisa payment
- JazzCash payment
- Cash on Delivery support
- Pakistan address support
- Local customer experience

---

## 🔐 Authentication System

- Secure login system
- User registration
- Protected routes
- Admin authorization
- Session management

---

## 🛠️ Tech Stack

### Frontend

- Next.js 14 (App Router)
- React
- TypeScript
- TailwindCSS

### Backend

- Next.js API Routes
- Node.js

### Database

- MongoDB
- Mongoose

### Authentication

- NextAuth.js

### Image Upload

- Cloudinary

### Deployment

- Vercel

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/hsn083/Alhamd-Collection.git
```

Go to project folder:

```bash
cd Alhamd-Collection
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🔧 Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=

NEXTAUTH_SECRET=

NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── account/        # Customer account
│   ├── products/       # Product pages
│   ├── checkout/       # Checkout system
│   ├── cart/           # Shopping cart
│   └── api/            # Backend APIs
│
├── components/         # Reusable components
├── models/             # Database models
├── utils/              # Helper functions
├── public/             # Images and assets
└── styles/             # Global styling
```

---

## 🌐 Pages

### Customer Pages

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

### Admin Pages

```
/admin
/admin/products
/admin/orders
/admin/customers
/admin/coupons
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository into Vercel
3. Add environment variables
4. Deploy

---

## 📝 Available Scripts

```bash
npm run dev
```
Start development server

```bash
npm run build
```
Create production build

```bash
npm start
```
Start production server

```bash
npm run lint
```
Check code quality

---

## 📞 Contact

**AlhamdCollection**

ALJANNAT MARKET  
ADDA MONGI BANGLA

Phone:

```
+923457791198
```

Email:

```
alhamdcollection518@gmail.com
```

---

## 📄 License

This project is developed for AlhamdCollection.

All rights reserved.

---

Built with ❤️ using Next.js and modern web technologies.
