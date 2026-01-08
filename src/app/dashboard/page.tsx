'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import Link from 'next/link';

interface DashboardStats {
  overview: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockValue: number;
    totalSalesValue: number;
  };
  categoryStats: Array<{ _id: string; count: number; totalStock: number }>;
  salesStats: Array<{ _id: string; totalSales: number; totalRevenue: number }>;
  monthlySales: Array<{ month: string; sales: number; revenue: number }>;
  recentProducts: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    status: string;
  }>;
  topSellingProducts: Array<{
    _id: string;
    name: string;
    sales: number;
    price: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here&apos;s an overview of your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.overview.totalProducts}
          icon={<Package className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Active Products"
          value={stats.overview.activeProducts}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.overview.lowStockProducts}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.overview.totalSalesValue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Sales</h3>
          <div className="h-72">
            {stats.monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                  <XAxis dataKey="month" className="dark:fill-gray-300" />
                  <YAxis className="dark:fill-gray-300" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #e5e7eb)' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Products by Category</h3>
          <div className="h-72">
            {stats.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ _id, count }) => `${_id}: ${count}`}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock by Category Bar Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Levels by Category</h3>
        <div className="h-72">
          {stats.categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                <XAxis dataKey="_id" className="dark:fill-gray-300" />
                <YAxis className="dark:fill-gray-300" />
                <Tooltip />
                <Bar dataKey="totalStock" fill="#3b82f6" name="Stock" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>No stock data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h3>
            <Link
              href="/dashboard/products"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentProducts.length > 0 ? (
              stats.recentProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : product.status === 'inactive'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No products yet</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Selling Products</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.topSellingProducts.length > 0 ? (
              stats.topSellingProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{product.sales} sold</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(product.sales * product.price)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
