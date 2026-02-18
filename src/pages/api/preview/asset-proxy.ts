Certainly! Below is the complete contents of the `src/pages/api/preview/asset-proxy.ts` file, which serves as an API endpoint for proxying assets with Content Security Policy (CSP) enforcement.

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import path from 'path';
import { sanitizeAssetPath } from '../../utils/sanitizeAssetPath'; // Assuming you have a utility to sanitize asset paths

const ASSET_ROOT = path.join(process.cwd(), 'public', 'assets'); // Adjust the root directory as necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assetPath } = req.query;

  if (typeof assetPath !== 'string') {
    return res.status(400).send('Invalid request');
  }

  try {
    // Sanitize the asset path to prevent directory traversal attacks
    const safeAssetPath = sanitizeAssetPath(assetPath);

    // Construct the full file path
    const filePath = path.join(ASSET_ROOT, safeAssetPath);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    // Read the file content
    const fileContent = fs.readFileSync(filePath);

    // Determine the MIME type based on the file extension
    let contentType: string;
    switch (path.extname(safeAssetPath).toLowerCase()) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      // Add more MIME types as needed
      default:
        contentType = 'application/octet-stream';
    }

    // Set the appropriate headers for CSP and content type
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline';");

    // Send the file content as the response
    return res.send(fileContent);
  } catch (error) {
    console.error('Error serving asset:', error);
    return res.status(500).send('Internal Server Error');
  }
}
```

### Explanation:

1. **Imports**: The necessary imports include `NextApiRequest` and `NextApiResponse` for handling API requests and responses, file system operations (`fs`) for reading files, and path manipulation.

2. **Asset Root Directory**: Define the root directory where your assets are stored. This example assumes assets are in a `public/assets` directory.

3. **Handler Function**:
   - Extract the `assetPath` from the query parameters.
   - Ensure `assetPath` is a valid string to prevent errors.
   - Sanitize the `assetPath` to prevent directory traversal attacks using a utility function (`sanitizeAssetPath`). This utility should ensure that the path does not navigate above the root directory.
   - Construct the full file path and check if the file exists.
   - Read the file content from disk.
   - Determine the MIME type based on the file extension.
   - Set the appropriate headers for `Content-Type` and `Content-Security-Policy`. The CSP header is set to allow inline styles only, which can be adjusted as needed.
   - Send the file content in the response.

4. **Error Handling**: If any step fails, an error message is logged, and an appropriate HTTP status code is returned.

### Note:
- Ensure you have a `sanitizeAssetPath` utility function that prevents directory traversal attacks. This function should validate the input path to ensure it does not navigate outside the intended directory.
- Adjust the MIME types as needed based on the types of assets you are serving.
- Customize the CSP header according to your security requirements.

This setup ensures that your asset proxy endpoint serves files securely, enforces a strict Content Security Policy, and prevents unauthorized access to sensitive directories.