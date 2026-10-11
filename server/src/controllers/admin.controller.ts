import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { calculateTrustScore, recalculateVendorTrust } from '../services/trustScore.service.js';

export async function getAdminAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalOrdersCount,
      totalUsersCount,
      totalVendorsCount,
      totalProductsCount,
      orders,
      vendorOrders,
      categoriesCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.vendorOrder.findMany({
        select: { commission: true, vendorEarnings: true, subtotal: true },
      }),
      prisma.category.count(),
    ]);

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCommission = vendorOrders.reduce((sum, vo) => sum + vo.commission, 0);

    // Recent 5 orders
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        vendorOrders: { include: { vendor: { select: { storeName: true } } } },
      },
    });

    return sendSuccess(res, {
      stats: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalOrders: totalOrdersCount,
        totalCustomers: totalUsersCount,
        totalVendors: totalVendorsCount,
        totalProducts: totalProductsCount,
        totalCategories: categoriesCount,
      },
      recentOrders,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getAllVendors(req: AuthenticatedRequest, res: Response) {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: { name: true, email: true, createdAt: true },
        },
        _count: {
          select: { products: true, vendorOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = vendors.map((v) => ({
      ...v,
      trustMetrics: calculateTrustScore(v),
    }));

    return sendSuccess(res, formatted);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateVendorStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, isEcoFriendlyCertified } = req.body; // APPROVED, REJECTED, PENDING, SUSPENDED

    const validStatuses = ['APPROVED', 'REJECTED', 'PENDING', 'SUSPENDED'];
    if (status && !validStatuses.includes(status)) {
      return sendError(res, `Invalid status value. Allowed: ${validStatuses.join(', ')}`, 400);
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isEcoFriendlyCertified === 'boolean') updateData.isEcoFriendlyCertified = isEcoFriendlyCertified;

    const updated = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    // Recalculate trust metrics
    await recalculateVendorTrust(id);

    return sendSuccess(res, updated, `Vendor updated successfully`);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getAllCustomers(req: AuthenticatedRequest, res: Response) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, customers);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function toggleCustomerStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return sendError(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return sendSuccess(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getAllOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        vendorOrders: {
          include: {
            vendor: { select: { id: true, storeName: true } },
            orderItems: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, orders);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getAllReviews(req: AuthenticatedRequest, res: Response) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, reviews);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    return sendSuccess(res, null, 'Review deleted');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description, image } = req.body;
    if (!name) return sendError(res, 'Category name is required', 400);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: { name, slug, description, image },
    });

    return sendSuccess(res, category, 'Category created', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
