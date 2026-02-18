import { NextFunction, Request, Response } from 'express';
import { UpstashRedisClient } from '@upstash/redis';

// Initialize Upstash Redis client with your configuration
const redis = new UpstashRedisClient({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Define rate limit options
interface RateLimitOptions {
  maxRequests: number;
  timeWindow: number; // in seconds
}

// Middleware function for rate limiting
export const rateLimitMiddleware = (options: RateLimitOptions) => async (req: Request, res: Response, next: NextFunction) => {
  const { maxRequests, timeWindow } = options;
  
  // Create a unique key based on the user's IP address and the endpoint
  const ip = req.ip;
  const key = `rate_limit:${ip}:${req.originalUrl}`;

  // Get the current count of requests from Redis
  const currentCount = await redis.incr(key);

  // If this is the first request, set the expiration time for the key
  if (currentCount === 1) {
    await redis.expire(key, timeWindow);
  }

  // Check if the user has exceeded the rate limit
  if (currentCount > maxRequests) {
    return res.status(429).json({
      message: 'Too many requests. Please try again later.',
    });
  }

  next();
};

// Example usage:
// const options = { maxRequests: 10, timeWindow: 60 }; // 10 requests per minute
// app.use(rateLimitMiddleware(options));
```

### Explanation:

- **Upstash Redis Client**: This is used to connect to your Upstash Redis instance. Make sure you have the `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` environment variables set.

- **Rate Limit Options**: The middleware accepts options to define the maximum number of requests (`maxRequests`) and the time window in seconds (`timeWindow`) within which these requests are counted.

- **Middleware Function**: 
  - It creates a unique key for each IP address and endpoint combination.
  - Uses Redis's `INCR` command to increment the request count.
  - Sets an expiration time on the first request to ensure the rate limit is applied over the specified time window.
  - Checks if the current request count exceeds the allowed number of requests and returns a `429 Too Many Requests` response if it does.
  - Proceeds to the next middleware or route handler if the rate limit is not exceeded.

### Usage:

You can use this middleware in your Express application by passing the desired rate limit options. For example:

```typescript
import express from 'express';
const app = express();

const options = { maxRequests: 10, timeWindow: 60 }; // 10 requests per minute
app.use(rateLimitMiddleware(options));

// Define your routes here

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

This will apply the rate limit to all routes in your Express application. Adjust the `maxRequests` and `timeWindow` values as needed for your use case.