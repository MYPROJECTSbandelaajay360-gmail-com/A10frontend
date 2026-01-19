import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Simple in-memory user storage for development
const users = [
  {
    email: 'agent@gmail.com',
    password: 'Agent123!',
    name: 'Support Agent',
    role: 'agent'
  },
  {
    email: 'testuser@gmail.com',
    password: 'TestPass123!',
    name: 'Test User',
    role: 'agent'
  },
  {
    email: 'vijay@gmail.com',
    password: 'vijay123',
    name: 'Vijay',
    role: 'agent'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate Gmail only
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Only Gmail addresses (@gmail.com) are allowed' },
        { status: 400 }
      );
    }

    let user = null;

    // 1. Try Database
    try {
      await connectDB();
      const dbUser = await User.findOne({ email: email.toLowerCase() });

      if (dbUser) {
        const isMatch = await bcrypt.compare(password, dbUser.passwordHash);
        if (isMatch) {
          user = {
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role || 'agent'
          };
        }
      }
    } catch (dbErr) {
      console.error('Database login check failed:', dbErr);
    }

    // 2. Try Hardcoded (Fallback/Dev)
    if (!user) {
      const hardcodedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (hardcodedUser && hardcodedUser.password === password) {
        user = {
          email: hardcodedUser.email,
          name: hardcodedUser.name,
          role: hardcodedUser.role
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create simple token (just base64 encoded user info for development)
    const token = Buffer.from(JSON.stringify({
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })).toString('base64');

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken: token,
      refreshToken: token
    });

    // Set httpOnly cookie for better security
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}
