// Producer script for enqueuing jobs to the queue.
import { QueueUtil } from '../shared/utils/queue.util';

const EMAIL_QUEUE_NAME = 'emailQueue';

async function produceEmailJob() {
  const queue = QueueUtil.getQueue(EMAIL_QUEUE_NAME);

  const jobData = {
    to: 'test@example.com',
    subject: 'Welcome Email',
    body: 'Welcome to our service!',
  };

  try {
    const job = await QueueUtil.enqueueJob(EMAIL_QUEUE_NAME, 'sendEmail', jobData, {
      attempts: 3, // Retry up to 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 1000, // Initial delay of 1 second
      },
    });
    console.log(`Job ${job.id} enqueued successfully.`);
  } catch (error: any) {
    console.error(`Failed to enqueue job: ${error.message}`);
  } finally {
    // It's important to close the queue connection when done to release resources
    await QueueUtil.closeAll();
  }
}

produceEmailJob();