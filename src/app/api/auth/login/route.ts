import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
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

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash +loginAttempts +lockUntil');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Account is locked. Try again after ${remainingTime} minutes.` },
        { status: 429 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await user.incLoginAttempts();
      const attemptsLeft = 5 - (user.loginAttempts + 1);
      
      if (attemptsLeft <= 0) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Account locked for 15 minutes.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `Invalid credentials. ${attemptsLeft} attempts remaining.` },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== 'APPROVED') {
      let message = 'Account not approved yet';
      if (user.status === 'REJECTED') message = 'Account has been rejected';
      if (user.status === 'SUSPENDED') message = 'Account has been suspended';
      
      return NextResponse.json(
        { error: message },
        { status: 403 }
      );
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login info
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    user.lastLoginAt = new Date();
    user.lastLoginIP = clientIP;
    await user.save();

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        accessToken,
      },
      { status: 200 }
    );

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
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
