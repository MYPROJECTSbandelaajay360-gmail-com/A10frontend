import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call Python chatbot service
    const chatbotResponse = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId || 'default',
      }),
    });

    if (!chatbotResponse.ok) {
      const errorData = await chatbotResponse.json();
      return NextResponse.json(
        { error: errorData.detail || 'Chatbot service error' },
        { status: chatbotResponse.status }
      );
    }

    const data = await chatbotResponse.json();

    return NextResponse.json({
      response: data.response,
      sources: data.sources || [],
      action: data.action,
    });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    
    // Check if chatbot service is running
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Chatbot service is not running. Please start the Python service.',
          detail: 'Run: python chatbot_service/app.py'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get response from chatbot' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check for chatbot service
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    
    return NextResponse.json({
      status: 'ok',
      chatbot_service: data,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Chatbot service is not running'
      },
      { status: 503 }
    );
  }
}
