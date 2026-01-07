import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'superadmin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const productBasicInfoSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Other']),
});

export const productPricingSchema = z.object({
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50),
});

export const productDetailsSchema = z.object({
  status: z.enum(['active', 'inactive', 'draft']),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Other']),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50),
  status: z.enum(['active', 'inactive', 'draft']),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
  })).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductBasicInfoInput = z.infer<typeof productBasicInfoSchema>;
export type ProductPricingInput = z.infer<typeof productPricingSchema>;
export type ProductDetailsInput = z.infer<typeof productDetailsSchema>;
