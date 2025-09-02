# AI Image Generation Setup Guide

This guide will help you set up AI-powered image generation for the Anubis Dog AI avatar generator.

## Overview

The application now supports multiple AI providers for generating high-quality avatars:

1. **OpenAI DALL-E 3** (Recommended) - Best quality, most reliable
2. **Stability AI** - Good for style transfer and custom models
3. **Replicate** - Access to various open-source models

## Quick Setup

### 1. Choose an AI Provider

Pick one of the supported providers and get an API key:

#### OpenAI DALL-E 3 (Recommended)
- Visit: https://platform.openai.com/api-keys
- Create an account and generate an API key
- Cost: ~$0.04 per image (1024x1024)

#### Stability AI
- Visit: https://platform.stability.ai/account/keys
- Create an account and generate an API key
- Cost: ~$0.01 per image

#### Replicate
- Visit: https://replicate.com/account/api-tokens
- Create an account and generate an API token
- Cost: ~$0.005 per image

### 2. Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy from .env.example and add your API keys
cp .env.example .env.local
```

Add your chosen provider's API key:

```env
# For OpenAI (recommended)
OPENAI_API_KEY=sk-your-openai-api-key-here

# OR for Stability AI
STABILITY_API_KEY=sk-your-stability-api-key-here

# OR for Replicate
REPLICATE_API_TOKEN=r8_your-replicate-token-here
```

### 3. Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Upload an image and select a style
3. Click "Generate" - you should see "AI is crafting your avatar..."
4. The system will automatically use your configured AI provider

## Features

### AI-Powered Generation
- **Smart Prompts**: AI automatically creates optimized prompts for each style
- **Style Enhancement**: Each style (Neon Glow, Dark Gold, etc.) gets specific AI enhancements
- **Fallback System**: If AI fails, falls back to canvas-based processing
- **Multiple Providers**: Automatically uses the best available provider

### Supported Styles
- **Neon Glow**: Vibrant neon colors with glowing effects
- **Dark Gold**: Rich golden tones with dark shadows
- **Cyberpunk Blue**: Electric blue accents with futuristic elements
- **Cosmic Purple**: Deep purple with cosmic/space themes

### Error Handling
- Graceful fallbacks if AI services are unavailable
- User-friendly error messages
- Automatic retry with different providers

## Advanced Configuration

### Using Multiple Providers

You can configure multiple providers for redundancy:

```env
OPENAI_API_KEY=your-openai-key
STABILITY_API_KEY=your-stability-key
REPLICATE_API_TOKEN=your-replicate-token
```

The system will automatically choose the best available provider in this order:
1. OpenAI (highest quality)
2. Stability AI (good balance)
3. Replicate (most affordable)

### Custom Prompts

The AI system automatically generates enhanced prompts, but you can customize the base prompts in:
- `src/ai/flows/image-generation.ts` - Main prompt template
- `src/lib/ai-providers.ts` - Provider-specific enhancements

## Troubleshooting

### Common Issues

1. **"No AI providers configured"**
   - Add at least one API key to your `.env.local` file
   - Restart your development server

2. **"API key invalid"**
   - Check your API key is correct and active
   - Ensure you have credits/usage available

3. **"Generation failed"**
   - Check your internet connection
   - Verify the API service is operational
   - The system will automatically fall back to canvas processing

### Testing API Keys

You can test your API keys using the browser console:

```javascript
// Test the API endpoint
fetch('/api/generate-avatar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    style: 'Neon Glow',
    prompt: 'Test generation'
  })
}).then(r => r.json()).then(console.log);
```

## Cost Optimization

### Tips to Reduce Costs

1. **Use Replicate** for development/testing (lowest cost)
2. **Batch processing** - generate multiple variations at once
3. **Cache results** - store generated images to avoid regeneration
4. **Set usage limits** in your AI provider dashboard

### Expected Costs

- **Development**: ~$1-5/month for testing
- **Production**: Depends on usage, typically $0.01-0.04 per generation

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```env
OPENAI_API_KEY=your-production-key
# OR your chosen provider's key
```

### Monitoring

Monitor your AI usage through:
- OpenAI: https://platform.openai.com/usage
- Stability AI: https://platform.stability.ai/account/billing
- Replicate: https://replicate.com/account/billing

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API keys are valid and have credits
3. Test with the fallback canvas generation first
4. Check the AI provider's status page for service issues

The AI system is designed to be robust with automatic fallbacks, so your users will always get some form of avatar generation even if AI services are temporarily unavailable.