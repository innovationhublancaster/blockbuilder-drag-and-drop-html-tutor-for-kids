Here's the complete contents for `src/lib/analyticsAggregator.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function analyticsAggregator(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { events } = req.body;

  try {
    // Validate and store raw events in the database
    await prisma.events_raw.createMany({
      data: events,
    });

    // Aggregate metrics and update aggregated tables
    await aggregateMetrics();

    res.status(200).json({ message: 'Events processed successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Failed to process analytics events', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function aggregateMetrics() {
  // Example aggregation logic for demonstration purposes
  // In a real-world scenario, you would have more complex queries and metrics

  // Aggregate daily metrics
  await prisma.$executeRaw`
    INSERT INTO metrics_daily (date, event_type, count)
    SELECT 
      DATE(event_time) AS date,
      event_name AS event_type,
      COUNT(*) AS count
    FROM events_raw
    WHERE DATE(event_time) = CURRENT_DATE
    GROUP BY date, event_type
  `;

  // Populate teacher-facing aggregated tables
  await prisma.$executeRaw`
    INSERT INTO assigned_lesson_completion (class_id, lesson_id, student_count, completion_rate)
    SELECT 
      c.id AS class_id,
      a.lesson_id,
      COUNT(DISTINCT s.id) AS student_count,
      AVG(CASE WHEN v.source = 'submission' THEN 1 ELSE 0 END) AS completion_rate
    FROM classes c
    JOIN assignments a ON c.id = a.class_id
    JOIN students s ON c.id = s.class_id
    LEFT JOIN project_versions v ON s.id = v.owner_id AND a.lesson_id = v.lesson_id
    GROUP BY c.id, a.lesson_id
  `;

  // Prune raw events older than the retention window
  const retentionDays = parseInt(process.env.RETENTION_DAYS || '30');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  await prisma.events_raw.deleteMany({
    where: {
      event_time: { lte: cutoffDate },
    },
  });
}
```

### Explanation:

1. **Imports**:
   - `PrismaClient` for database operations.
   - `Sentry` for error tracking.
   - `NextApiRequest` and `NextApiResponse` for handling API requests.

2. **API Handler**:
   - The function checks if the request method is `POST`. If not, it returns a 405 status code.
   - It extracts `events` from the request body.
   - It stores raw events in the `events_raw` table using `prisma.events_raw.createMany`.
   - It calls the `aggregateMetrics` function to aggregate metrics and update aggregated tables.
   - If successful, it returns a 200 status code. Otherwise, it captures the error with Sentry, logs it, and returns a 500 status code.

3. **Aggregation Logic**:
   - The `aggregateMetrics` function performs the following operations:
     - Inserts daily metrics into the `metrics_daily` table.
     - Populates teacher-facing aggregated tables like `assigned_lesson_completion`.
     - Prunes raw events older than the retention window defined by the `RETENTION_DAYS` environment variable.

### Note:
- This is a basic example and should be expanded with more complex aggregation logic based on your specific requirements.
- Ensure that the database schema (`events_raw`, `metrics_daily`, `assigned_lesson_completion`) matches the queries used in this file.