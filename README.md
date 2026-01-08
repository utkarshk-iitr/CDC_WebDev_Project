# SSR E-Commerce Product Management Dashboard

A server-side rendered (SSR) administrative dashboard for managing products in an e-commerce system, built with Next.js 14.

## 🌟 Features

### Core Features
- **Server-Side Rendering (SSR)** - Fast page loads and improved SEO using Next.js App Router
- **Product Management (CRUD)** - Create, Read, Update, and Delete products
- **Multi-Step Product Forms** - Intuitive 4-step product creation wizard with validation
- **Data Visualization** - Interactive charts showing sales metrics, stock levels, and category distribution
- **Image Upload** - Secure cloud image storage using Cloudinary
- **Authentication & Authorization** - Secure admin login with JWT tokens
- **Admin Management** - Superadmin can onboard new administrators

### Technical Features
- TypeScript for type safety
- React Query for efficient data fetching and caching
- Zod for form validation
- Recharts for data visualization
- Tailwind CSS for styling
- MongoDB for database
- Responsive design for all devices

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend & Backend | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB |
| Data Fetching | React Query (TanStack Query) |
| Form Validation | Zod + React Hook Form |
| Data Visualization | Recharts |
| Image Storage | Cloudinary |
| Authentication | JWT (JSON Web Tokens) |
| Icons | Lucide React |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Cloudinary** account (free tier available)

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ssr-ecommerce-dashboard.git
cd ssr-ecommerce-dashboard
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your credentials:

```env
# MongoDB Connection String
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/ecommerce-dashboard
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce-dashboard

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Cloudinary Configuration (get from Cloudinary Dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with password
4. Get the connection string and add to `.env.local`
5. Add your IP address to the whitelist (or allow all IPs for development)

#### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Step 5: Set Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com) and create a free account
2. Navigate to Settings > API Keys
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env.local` file

### Step 6: Seed the Database

Run the seed script to create demo data:

```bash
npm run seed
```

This creates:
- Demo admin accounts
- Sample products across different categories

### Step 7: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@demo.com | admin123 |
| **Regular Admin** | demo@demo.com | admin123 |

> **Note:** Super Admin can access the "Manage Admins" page to onboard new administrators. Regular admins cannot see this option.

## 📖 Usage Guide

### Dashboard Overview
The main dashboard displays:
- Total products, active products, low stock alerts
- Monthly sales chart
- Products by category (pie chart)
- Stock levels by category (bar chart)
- Recent products and top-selling items

### Managing Products

1. **View Products**: Navigate to Products page to see all products with filtering and search
2. **Add Product**: Click "Add Product" and follow the 4-step wizard:
   - Step 1: Basic Info (name, description, category)
   - Step 2: Pricing (price, stock, SKU)
   - Step 3: Images (upload product images)
   - Step 4: Status (draft, active, inactive)
3. **Edit Product**: Click the edit icon on any product row
4. **Delete Product**: Click the delete icon and confirm

### Admin Management (Super Admin Only)
1. Navigate to "Manage Admins" in the sidebar
2. View all existing administrators
3. Click "Add Admin" to create new admin accounts
4. Choose between Admin or Super Admin roles

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click "New Project" and import your repository

4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

5. Click "Deploy"

6. After deployment, run the seed script:
```bash
# Set environment variables locally to point to production DB
MONGODB_URI=your-production-mongodb-uri npm run seed
```

## 📁 Project Structure

```
ssr-ecommerce-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product CRUD endpoints
│   │   │   ├── dashboard/     # Dashboard statistics
│   │   │   └── upload/        # Image upload endpoint
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── products/      # Product management
│   │   │   └── admins/        # Admin management
│   │   └── login/             # Login page
│   ├── components/            # Reusable components
│   ├── context/               # React context providers
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # JWT authentication
│   │   ├── db.ts             # MongoDB connection
│   │   ├── cloudinary.ts     # Cloudinary config
│   │   ├── utils.ts          # Helper functions
│   │   └── validations.ts    # Zod schemas
│   └── models/                # MongoDB models
│       ├── User.ts
│       └── Product.ts
├── scripts/
│   └── seed.ts               # Database seeding script
├── public/                    # Static assets
└── package.json
```

## 🧪 Testing the Application

### Manual Testing Checklist

1. **Authentication**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials (should show error)
   - [ ] Logout functionality
   - [ ] Protected routes redirect to login

2. **Product Management**
   - [ ] View products list with pagination
   - [ ] Search products by name
   - [ ] Filter by category and status
   - [ ] Create new product (all steps)
   - [ ] Upload product images
   - [ ] Edit existing product
   - [ ] Delete product

3. **Dashboard**
   - [ ] View statistics cards
   - [ ] View sales charts
   - [ ] View category distribution
   - [ ] View recent and top-selling products

4. **Admin Management (as Super Admin)**
   - [ ] View admin list
   - [ ] Create new admin
   - [ ] Create new super admin

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens stored in HTTP-only cookies
- Server-side route protection via middleware
- API route authentication
- Input validation with Zod
- CSRF protection via SameSite cookies

## 👤 Author

**Utkarsh Kumar**
- GitHub: [@utkarshk-iitr](https://github.com/utkarshk-iitr)

---
