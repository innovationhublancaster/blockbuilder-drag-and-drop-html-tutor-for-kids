import { NextApiRequest, NextApiResponse } from 'next';
import { DrizzleClient } from '@/db/drizzleClient'; // Adjust import based on actual path
import { z } from 'zod';
import { createValidationResult } from '@/lib/validationEngine'; // Adjust import based on actual path
import { generateNotification } from '@/lib/notifications'; // Adjust import based on actual path

const submissionSchema = z.object({
  studentId: z.string().uuid(),
  projectId: z.string().uuid(),
  source: z.literal('submission'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { studentId, projectId } = submissionSchema.parse(req.body);

  const drizzleClient = new DrizzleClient();
  const trx = await drizzleClient.startTransaction();

  try {
    // Create a project_version snapshot
    const projectVersion = await trx.project_versions.create({
      student_id: studentId,
      project_id: projectId,
      source: 'submission',
    });

    // Create a submission record
    const submission = await trx.submissions.create({
      student_id: studentId,
      project_id: projectId,
      project_version_id: projectVersion.id,
    });

    // Trigger validation job
    const validationResult = await createValidationResult(submission.project_version_id);

    // Generate notifications for the teacher/admins
    generateNotification(validationResult, studentId, projectId);

    await trx.commit();

    res.status(201).json({ submission });
  } catch (error) {
    await trx.rollback();
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

### Explanation:
1. **Method Check**: The endpoint only accepts POST requests.
2. **Validation**: The request body is validated using `zod` to ensure it contains the required fields (`studentId`, `projectId`, and `source`).
3. **Database Operations**:
   - A project version snapshot is created in the `project_versions` table.
   - A submission record is created in the `submissions` table.
4. **Validation Job**: The `createValidationResult` function (from a hypothetical validation engine) is called to process the submission and create validation results.
5. **Notifications**: The `generateNotification` function (also hypothetical) is used to send notifications about the submission status.
6. **Transaction Management**: All database operations are wrapped in a transaction to ensure atomicity.
7. **Error Handling**: If any operation fails, the transaction is rolled back, and an error response is returned.

Make sure to adjust imports and function calls based on your actual project structure and logic.