// Utility for managing BullMQ queues.
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { AppConfig } from '../config/app.config';

const connection = {
  host: AppConfig.redis.host,
  port: AppConfig.redis.port,
  password: AppConfig.redis.password,
};

export class QueueUtil {
  private static queues: Map<string, Queue> = new Map();
  private static schedulers: Map<string, QueueScheduler> = new Map();
  private static workers: Map<string, Worker> = new Map();

  /**
   * Returns a BullMQ Queue instance, creating it if it doesn't already exist.
   * @param queueName The name of the queue.
   * @returns A BullMQ Queue instance.
   */
  public static getQueue(queueName: string): Queue {
    if (!QueueUtil.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection });
      QueueUtil.queues.set(queueName, queue);
      // Optionally, add a QueueScheduler for delayed jobs
      const scheduler = new QueueScheduler(queueName, { connection });
      QueueUtil.schedulers.set(queueName, scheduler);
    }
    return QueueUtil.queues.get(queueName)!;
  }

  /**
   * Adds a job to the specified queue.
   * @param queueName The name of the queue.
   * @param jobName The name of the job.
   * @param data The data associated with the job.
   * @param opts Optional job options.
   * @returns A promise that resolves to the added job.
   */
  public static async enqueueJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    opts?: object,
  ): Promise<any> {
    const queue = QueueUtil.getQueue(queueName);
    return queue.add(jobName, data, opts);
  }

  /**
   * Creates and registers a worker for the specified queue.
   * @param queueName The name of the queue.
   * @param processor The job processing function.
   * @returns A BullMQ Worker instance.
   */
  public static createWorker(
    queueName: string,
    processor: (job: any) => Promise<any>,
  ): Worker {
    if (QueueUtil.workers.has(queueName)) {
      // Return existing worker if already created
      return QueueUtil.workers.get(queueName)!;
    }
    const worker = new Worker(queueName, processor, { connection });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed: ${err.message}`);
    });

    QueueUtil.workers.set(queueName, worker);
    return worker;
  }

  /**
   * Closes all active queues, schedulers, and workers.
   */
  public static async closeAll(): Promise<void> {
    for (const queue of QueueUtil.queues.values()) {
      await queue.close();
    }
    for (const scheduler of QueueUtil.schedulers.values()) {
      await scheduler.close();
    }
    for (const worker of QueueUtil.workers.values()) {
      await worker.close();
    }
    QueueUtil.queues.clear();
    QueueUtil.schedulers.clear();
    QueueUtil.workers.clear();
  }
}