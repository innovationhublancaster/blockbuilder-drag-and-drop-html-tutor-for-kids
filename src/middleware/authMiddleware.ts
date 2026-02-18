Here's a complete implementation of `authMiddleware.ts` based on the tasks outlined in your implementation plan:

```typescript
// src/middleware/authMiddleware.ts

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: User;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Assuming the JWT payload contains a userId
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    res.status(500).json({ message: 'Failed to authenticate token' });
  }
};

export default authMiddleware;
```

### Explanation

1. **Imports**: The middleware imports necessary modules and types from Express, JSON Web Token (JWT), configuration settings, and the User model.

2. **Type Extension**: It extends the `Request` interface to include a `user` property for type safety when accessing authenticated user data within route handlers.

3. **Middleware Function**: The `authMiddleware` function:
   - Checks for an authorization token in the request headers.
   - If no token is found, it returns a 401 Unauthorized response.
   - Verifies the token using the secret key from the configuration.
   - Retrieves the user associated with the decoded token.
   - Attaches the user to the `req` object if valid.
   - Calls `next()` to proceed to the next middleware or route handler.
   - Catches and handles errors, returning appropriate error responses.

4. **Export**: The middleware is exported for use in other parts of your application.

### Usage

This middleware can be used in Express routes that require authentication by adding it as a parameter in your route handlers:

```typescript
import express from 'express';
import authMiddleware from './middleware/authMiddleware';

const router = express.Router();

router.get('/protected', authMiddleware, (req, res) => {
  // Access the authenticated user with req.user
  res.json({ message: 'This is a protected route', user: req.user });
});

export default router;
```

In this example, any request to `/protected` must include a valid JWT token, and the `authMiddleware` will ensure that only authenticated users can access the route.