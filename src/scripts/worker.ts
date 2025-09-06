// Worker script for processing jobs from the queue.
import { Worker } from 'bullmq';
import { QueueUtil } from '../shared/utils/queue.util';

const EMAIL_QUEUE_NAME = 'emailQueue';

/**
 * Processor function for the email queue.
 * This function will be called for each job in the queue.
 * @param job The job to be processed.
 */
const emailProcessor = async (job: any) => {
  console.log(`Processing job ${job.id} with data:`, job.data);
  // Simulate sending an email
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async work
  console.log(`Email sent to ${job.data.to} with subject "${job.data.subject}"`);
  return { success: true, message: `Email sent to ${job.data.to}` };
};

// Create a worker for the email queue
const emailWorker = QueueUtil.createWorker(EMAIL_QUEUE_NAME, emailProcessor);

emailWorker.on('error', (err) => {
  // log the error
  console.error(`Worker error: ${err.message}`);
});

console.log(`Worker for queue '${EMAIL_QUEUE_NAME}' started.`);

// Keep the process alive
process.on('SIGINT', async () => {
  await QueueUtil.closeAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await QueueUtil.closeAll();
  process.exit(0);
});