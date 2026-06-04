const calls = [];

export function checkRateLimit(maxCalls = 3, windowMs = 60000) {
  const now = Date.now();
  const recent = calls.filter(t => now - t < windowMs);
  if (recent.length >= maxCalls) return false;
  recent.push(now);
  // Trim
  while (calls.length > 0 && now - calls[0] > windowMs) calls.shift();
  calls.push(now);
  return true;
}
