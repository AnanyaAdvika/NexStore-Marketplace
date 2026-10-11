import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { recalculateVendorTrust } from '../services/trustScore.service.js';

export async function addReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return sendError(res, 'productId, rating, and comment are required', 400);
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return sendError(res, 'Product not found', 404);

    // 1. Check if user already reviewed this product (duplicate prevention)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (existingReview) {
      return sendError(res, 'You have already reviewed this product', 400);
    }

    // 2. Validate that the user has a DELIVERED order containing this product
    const deliveredItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.id,
        },
        OR: [
          { order: { orderStatus: 'DELIVERED' } },
          { vendorOrder: { status: 'DELIVERED' } },
        ],
      },
    });

    if (!deliveredItem) {
      return sendError(
        res,
        'Only customers who have received this product (DELIVERED status) can submit a review',
        403
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: numRating,
        comment,
        isVerifiedPurchase: true,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Recompute product rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: allReviews.length,
      },
    });

    // Recompute vendor ratings across all vendor products
    const vendorProducts = await prisma.product.findMany({
      where: { vendorId: product.vendorId },
      include: { reviews: true },
    });

    let totalReviewsCount = 0;
    let vendorRatingSum = 0;
    for (const vp of vendorProducts) {
      for (const r of vp.reviews) {
        totalReviewsCount++;
        vendorRatingSum += r.rating;
      }
    }

    const vendorAvg = totalReviewsCount > 0 ? vendorRatingSum / totalReviewsCount : 4.5;

    await prisma.vendor.update({
      where: { id: product.vendorId },
      data: {
        rating: Math.round(vendorAvg * 10) / 10,
        totalReviews: totalReviewsCount,
      },
    });

    // Recalculate Vendor Trust Score
    await recalculateVendorTrust(product.vendorId);

    return sendSuccess(res, review, 'Review added successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getProductReviews(req: any, res: Response) {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, reviews);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function checkReviewEligibility(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { productId } = req.params;

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    const deliveredItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.id,
        },
        OR: [
          { order: { orderStatus: 'DELIVERED' } },
          { vendorOrder: { status: 'DELIVERED' } },
        ],
      },
    });

    return sendSuccess(res, {
      canReview: Boolean(deliveredItem && !existingReview),
      hasDeliveredOrder: Boolean(deliveredItem),
      alreadyReviewed: Boolean(existingReview),
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
