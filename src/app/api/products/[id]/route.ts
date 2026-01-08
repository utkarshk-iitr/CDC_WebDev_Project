import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { deleteImage } from '@/lib/cloudinary';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const validation = productSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (validation.data.sku && validation.data.sku !== existingProduct.sku) {
      const duplicateSku = await Product.findOne({
        sku: validation.data.sku.toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicateSku) {
        return NextResponse.json(
          { message: 'Product with this SKU already exists' },
          { status: 409 }
        );
      }
    }

    const updateData = {
      ...validation.data,
      sku: validation.data.sku ? validation.data.sku.toUpperCase() : existingProduct.sku,
    };

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      try {
        await deleteImage(image.publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
