import { NextRequest, NextResponse } from 'next/server';
import { FreeAIProviderFactory } from '@/lib/free-ai-providers';

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

    // Use free AI providers
    const provider = await FreeAIProviderFactory.getBestAvailableProvider();
    
    const result = await provider.generateImage({
      prompt: body.prompt || `Transform this into an ancient Egyptian Anubis-themed avatar with ${body.style} aesthetic. Include pharaoh headdress, Egyptian jewelry, and mystical elements.`,
      userImage: body.userImage,
      style: body.style,
      width: 1024,
      height: 1024,
    });

    return NextResponse.json({
      success: true,
      data: {
        generatedImage: result.imageUrl,
        prompt: result.prompt,
        provider: result.provider,
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