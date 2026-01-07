import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { registerAdminSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Unauthorized. Only superadmins can register new admins.' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const validation = registerAdminSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    return NextResponse.json({
      message: 'Admin created successfully',
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register admin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await dbConnect();
    const admins = await User.find().select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
