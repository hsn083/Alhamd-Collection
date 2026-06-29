# Zorynix - Premium Gaming & Tech E-Commerce Store

A professional online store built with Next.js, TypeScript, and TailwindCSS for selling gaming accessories, mobile accessories, and tech gadgets across Pakistan.

## 🚀 Features

### Customer Features
- **Home Page** with Hero section, Features, Categories, Featured Products, and Newsletter
- **Shop Page** with advanced filters (category, price, brand, rating, availability), sorting, and search
- **Product Detail Page** with images, specifications, features, reviews, and related products
- **Shopping Cart** with quantity management, coupon codes, and shipping calculation
- **Checkout System** with multiple payment methods:
  - Cash on Delivery (COD)
  - EasyPaisa
  - JazzCash
  - Bank Transfer
  - Debit/Credit Cards
- **User Account** with:
  - Login/Registration
  - Order history and tracking
  - Wishlist management
  - Saved addresses
  - Profile settings
- **Wishlist System** to save and share favorite products

### Admin Panel
- **Dashboard** with sales statistics, order overview, and top products
- **Product Management** (CRUD operations)
- **Order Management** with status updates and invoice generation
- **Customer Management** with profiles and order history
- **Coupon Management** with percentage and fixed discounts
- **Inventory Management** with stock tracking and low stock alerts

### Pakistan-Specific Features
- PKR (Pakistani Rupee) currency
- Local payment methods (EasyPaisa, JazzCash)
- Cash on Delivery available nationwide
- Delivery coverage across all major cities and rural areas
- Pakistan-specific provinces and cities

### Additional Features
- **Blog Section** for SEO and content marketing
- **SEO Optimization** with meta tags, sitemap, and schema markup
- **Responsive Design** for mobile, tablet, and desktop
- **Modern UI** with shadcn/ui components
- **State Management** with Zustand
- **TypeScript** for type safety

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Zorynix
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── blog/              # Blog pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── product/           # Product detail pages
│   ├── shop/              # Shop page
│   ├── account/           # User account pages
│   ├── wishlist/          # Wishlist page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Site header
│   ├── Footer.tsx        # Site footer
│   ├── Hero.tsx          # Hero section
│   ├── Features.tsx      # Features section
│   ├── Categories.tsx    # Categories section
│   ├── FeaturedProducts.tsx
│   ├── Newsletter.tsx    # Newsletter section
│   └── ProductCard.tsx   # Product card component
├── data/                 # Mock data
│   └── products.ts       # Product data
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities
├── store/                # Zustand stores
│   ├── cartStore.ts      # Shopping cart state
│   └── wishlistStore.ts  # Wishlist state
└── types/                # TypeScript types
    └── index.ts          # Type definitions
```

## 🎨 Pages

### Customer Pages
- `/` - Home page
- `/shop` - Shop all products
- `/product/[slug]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/account` - User account dashboard
- `/wishlist` - Wishlist
- `/blog` - Blog listing

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/coupons` - Coupon management

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=

# Payment Gateways
EASYPAISA_API_KEY=
JAZZCASH_API_KEY=
STRIPE_SECRET_KEY=

# Email Service
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Analytics
GOOGLE_ANALYTICS_ID=
FACEBOOK_PIXEL_ID=
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email info@zorynix.pk or visit our website at https://zorynix.pk

---

Built with ❤️ for the Pakistani gaming community
