import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'VENDOR']).default('CUSTOMER'),
  storeName: z.string().optional(),
  storeDescription: z.string().optional(),
  isEcoFriendlyCertified: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
      },
    });

    let vendorRecord = null;
    if (data.role === 'VENDOR') {
      const storeName = data.storeName || `${data.name}'s Store`;
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      vendorRecord = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName,
          slug,
          description: data.storeDescription || 'Marketplace seller applicant',
          isEcoFriendlyCertified: false, // Must be audited and approved by Admin
          status: 'PENDING', // Awaiting Admin verification and approval
          trustScore: 70.0,
        },
      });
    }

    // Auto-create cart for customer
    if (data.role === 'CUSTOMER') {
      await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      vendorId: vendorRecord?.id,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        vendor: vendorRecord,
      },
    }, 'Registration successful', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.errors[0]?.message || 'Validation error', 400, error.errors);
    }
    return sendError(res, error.message || 'Registration failed', 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendor: true },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendor?.id,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        vendor: user.vendor,
      },
    }, 'Login successful');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError(res, error.errors[0]?.message || 'Validation error', 400);
    }
    return sendError(res, error.message || 'Login failed', 500);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vendor: true,
        addresses: true,
      },
    });

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      vendor: user.vendor,
      addresses: user.addresses,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      include: { vendor: true },
    });

    return sendSuccess(res, {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      vendor: updated.vendor,
    }, 'Profile updated');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
