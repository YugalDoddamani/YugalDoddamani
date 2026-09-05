export const config = {
  matcher: ['/robots.txt', '/llms.txt'],
};

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

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

  const isBot = botPatterns.some((pattern) => pattern.test(userAgent));

  // If it's a human, redirect them to a nice 404 error page or respond with a 404 status
  if (!isBot) {
    // Option A: Send them straight to your styled 404.html page
    return Response.redirect(new URL('/404.html', request.url), 302);
  }

  // If it's a bot, let it pass through to read the text file
  return fetch(request);
}
