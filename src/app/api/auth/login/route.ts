import { NextRequest, NextResponse } from 'next/server';

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

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
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
