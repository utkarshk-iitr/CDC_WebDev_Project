import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define schemas inline to avoid import issues
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  images: [{ url: String, publicId: String }],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' },
  sales: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('Current env file path:', path.resolve(process.cwd(), '.env.local'));
    process.exit(1);
  }

  console.log('🌱 Connecting to MongoDB Atlas...');
  console.log('URI:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin users
    console.log('👤 Creating admin users...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const users = await User.create([
      {
        name: 'Super Admin',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'superadmin',
      },
      {
        name: 'Demo Admin',
        email: 'demo@demo.com',
        password: hashedPassword,
        role: 'admin',
      },
    ]);
    console.log(`✅ Created ${users.length} admin users`);

    // Create sample products
    console.log('📦 Creating sample products...');
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
    const statuses = ['active', 'inactive', 'draft'];
    
    const products = [];
    for (let i = 1; i <= 25; i++) {
      products.push({
        name: `Product ${i}`,
        description: `This is a detailed description for Product ${i}. It includes all the features and specifications that customers need to know.`,
        price: Math.floor(Math.random() * 500) + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        stock: Math.floor(Math.random() * 100),
        sku: `PROD-${String(i).padStart(4, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        sales: Math.floor(Math.random() * 200),
        images: [
          { url: `https://picsum.photos/seed/${i}/400/400`, publicId: `seed-${i}` },
          { url: `https://picsum.photos/seed/${i + 100}/400/400`, publicId: `seed-${i + 100}` },
        ],
      });
    }

    await Product.create(products);
    console.log(`✅ Created ${products.length} sample products`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Super Admin:                            │');
    console.log('│   Email: admin@demo.com                 │');
    console.log('│   Password: admin123                    │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ Regular Admin:                          │');
    console.log('│   Email: demo@demo.com                  │');
    console.log('│   Password: admin123                    │');
    console.log('└─────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
