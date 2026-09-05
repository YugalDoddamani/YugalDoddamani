export const config = {
  matcher: ['/robots.txt', '/llms.txt'],
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Recognized search engine and AI crawlers
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

  // If it's a human browser, fetch and serve your 404.html page instead
  if (!isBot) {
    const url = new URL('/404.html', request.url);
    return fetch(url);
  }

  // If it's a bot, let the request pass through normally to the actual text file
  return fetch(request);
}
