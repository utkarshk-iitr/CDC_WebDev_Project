import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE admin (Super Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Unauthorized. Only superadmins can delete admins.' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = await params;

    // Prevent deleting yourself
    if (id === currentUser.userId) {
      return NextResponse.json(
        { message: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    const admin = await User.findById(id);
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
