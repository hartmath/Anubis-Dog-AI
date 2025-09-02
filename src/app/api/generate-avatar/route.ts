import { NextRequest, NextResponse } from 'next/server';
import { generateAvatarImage } from '@/ai/flows/image-generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userImage) {
      return NextResponse.json(
        { error: 'User image is required' },
        { status: 400 }
      );
    }
    
    if (!body.style) {
      return NextResponse.json(
        { error: 'Style selection is required' },
        { status: 400 }
      );
    }

    // Call the AI flow
    const result = await generateAvatarImage({
      userImage: body.userImage,
      style: body.style,
      prompt: body.prompt || '',
    });

    return NextResponse.json({
      success: true,
      data: {
        generatedImage: result.generatedImage,
        prompt: result.prompt,
      },
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}