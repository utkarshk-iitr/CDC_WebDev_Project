import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get various statistics
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      categoryStats,
      salesStats,
      recentProducts,
      topSellingProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ stock: 0 }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
        { $sort: { count: -1 } },
      ]),
      Product.aggregate([
        { $group: { _id: '$category', totalSales: { $sum: '$sales' }, totalRevenue: { $sum: { $multiply: ['$sales', '$price'] } } } },
        { $sort: { totalSales: -1 } },
      ]),
      Product.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ sales: { $gt: 0 } }).sort({ sales: -1 }).limit(5).lean(),
    ]);

    // Calculate total values
    const totalStockValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } },
    ]);

    const totalSalesValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$sales', '$price'] } } } },
    ]);

    // Monthly sales data (simulated based on product creation dates)
    const monthlySales = await Product.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$sales' },
          revenue: { $sum: { $multiply: ['$sales', '$price'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = monthlySales.map((item) => ({
      month: monthNames[item._id - 1],
      sales: item.sales,
      revenue: item.revenue,
    }));

    return NextResponse.json({
      overview: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalStockValue: totalStockValue[0]?.total || 0,
        totalSalesValue: totalSalesValue[0]?.total || 0,
      },
      categoryStats,
      salesStats,
      monthlySales: formattedMonthlySales,
      recentProducts,
      topSellingProducts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
