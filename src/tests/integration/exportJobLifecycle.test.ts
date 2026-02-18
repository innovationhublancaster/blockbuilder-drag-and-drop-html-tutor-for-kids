import { describe, it, expect } from '@jest/globals';
import supertest from 'supertest';
import app from '../app'; // Assuming your main application file is named `app.ts`
import { generateTestToken } from './utils'; // Utility to generate test token

const request = supertest(app);

describe('Export Job Lifecycle Integration Tests', () => {
  let teacherToken: string;

  beforeAll(async () => {
    // Generate a valid teacher token for authentication
    teacherToken = await generateTestToken('teacher');
  });

  it('should create an export job and return the correct status', async () => {
    const classId = 'test-class-id'; // Replace with actual class ID if needed

    const response = await request.post(`/api/classes/${classId}/exports`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('job_id');
    expect(response.body.job_status).toBe('queued');
  });

  it('should fetch export job status and return the correct details', async () => {
    const classId = 'test-class-id'; // Replace with actual class ID if needed
    const jobId = 'existing-job-id'; // Replace with an existing job ID for testing

    const response = await request.get(`/api/classes/${classId}/exports/${jobId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('job_id');
    expect(response.body.job_status).toBe('queued'); // or 'completed', 'failed' based on the actual job status
  });

  it('should fetch export results and return a valid URL', async () => {
    const classId = 'test-class-id'; // Replace with actual class ID if needed
    const jobId = 'completed-job-id'; // Replace with an existing completed job ID for testing

    const response = await request.get(`/api/classes/${classId}/exports/${jobId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result_url');
    expect(response.body.result_url).toMatch(/^https:\/\/.*\.zip$/); // Adjust regex based on expected URL format
  });

  it('should handle non-existent job ID gracefully', async () => {
    const classId = 'test-class-id'; // Replace with actual class ID if needed
    const jobId = 'non-existent-job-id';

    const response = await request.get(`/api/classes/${classId}/exports/${jobId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Export job not found');
  });

  it('should handle unauthorized access attempts', async () => {
    const classId = 'test-class-id'; // Replace with actual class ID if needed
    const jobId = 'existing-job-id'; // Replace with an existing job ID for testing

    const response = await request.get(`/api/classes/${classId}/exports/${jobId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});
```

### Explanation:
- **Setup**: The test file starts by importing necessary modules and setting up a supertest client for the application.
- **Before All**: A `beforeAll` hook is used to generate a valid teacher token for authentication purposes.
- **Test Cases**:
  - **Create Export Job**: Tests if creating an export job returns a successful status and includes a job ID with 'queued' status.
  - **Fetch Export Job Status**: Verifies fetching an existing job's status by checking the returned job details.
  - **Fetch Export Results**: Ensures that fetching results from a completed job returns a valid URL.
  - **Handle Non-existent Job**: Tests how the application handles requests for non-existent job IDs.
  - **Unauthorized Access**: Checks if unauthorized access attempts are correctly handled.

### Notes:
- Ensure that the `generateTestToken` utility function correctly generates tokens with appropriate roles (e.g., 'teacher').
- Replace placeholders like `'test-class-id'`, `'existing-job-id'`, and `'completed-job-id'` with actual values from your test environment.
- Adjust regex patterns in assertions to match the expected formats of URLs and other fields returned by your API.