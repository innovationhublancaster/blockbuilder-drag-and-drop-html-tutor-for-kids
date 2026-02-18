Certainly! Below is the complete content for the `src/pages/api/export/create.ts` file, which serves as an API endpoint for creating export jobs.

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { generateExportJob } from '@/lib/exportJobs';
import { createJob, getSubmissionById } from '@/lib/dbUtils';
import { ExportJob } from '@/types/exportTypes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { submissionId } = req.body;

  if (!submissionId || typeof submissionId !== 'string') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    // Fetch the submission from the database
    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Generate a unique job ID for the export job
    const jobId = uuidv4();

    // Create an export job entry in the database
    await createJob(jobId, submissionId);

    // Simulate generating the export job (this would typically involve creating a ZIP/HTML bundle)
    const exportUrl = `https://example.com/downloads/${jobId}.zip`;

    // Return the job ID and the expected download URL
    res.status(201).json({ jobId, exportUrl });
  } catch (error) {
    console.error('Error creating export job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

### Explanation:
- **HTTP Method Check**: The function first checks if the incoming request is a POST. If not, it returns a `405 Method Not Allowed` response.
- **Request Body Validation**: It validates that the request body contains a `submissionId` and that it is a string.
- **Database Interaction**:
  - Fetches the submission from the database using a hypothetical `getSubmissionById` function.
  - If the submission does not exist, it returns a `404 Not Found` response.
- **Job Creation**:
  - Generates a unique job ID using `uuidv4`.
  - Creates an entry for the export job in the database using a hypothetical `createJob` function.
- **Export Job Generation**: Simulates generating the export job by creating a mock download URL. In a real-world scenario, this would involve generating the actual ZIP/HTML bundle.
- **Response**: Returns a `201 Created` response with the job ID and the expected download URL.

### Note:
This code assumes the existence of several utility functions (`getSubmissionById`, `createJob`) and types (`ExportJob`). You will need to implement these based on your application's database schema and logic.