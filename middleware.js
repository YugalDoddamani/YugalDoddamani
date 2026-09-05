import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Only target robots.txt and llms.txt
  if (path === '/robots.txt' || path === '/llms.txt') {
    const userAgent = request.headers.get('user-agent') || '';

    // List of common search engine and AI crawler signatures
    const botPatterns = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /gptbot/i,
      /claudebot/i,
      /anthropic-ai/i,
      /cohere-ai/i,
      /perplexabot/i,
      /applebot/i,
      /twitterbot/i,
      /linkedinbot/i,
      /facebookexternalhit/i
    ];

    // Check if the requester is a recognized bot
    const isBot = botPatterns.some((pattern) => pattern.test(userAgent));

    // If it's a human browser, rewrite the request to show your 404 page
    if (!isBot) {
      return NextResponse.rewrite(new URL('/404.html', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths trigger this middleware
export const config = {
  matcher: ['/robots.txt', '/llms.txt'],
};
