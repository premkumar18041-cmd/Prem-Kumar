// BullMQ / Redis-style Background Job Queue for Accessories.lt
import crypto from 'crypto';

export type JobType = 
  | 'SEND_ORDER_CONFIRMATION'
  | 'SEND_SHIPPING_UPDATE'
  | 'SEND_WELCOME_EMAIL'
  | 'PROCESS_PAYMENT_WEBHOOK'
  | 'ABANDONED_CART_REMINDER'
  | 'CHECK_LOW_STOCK_ALERTS'
  | 'AGGREGATE_HOURLY_ANALYTICS';

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING';

export interface BackgroundJob<T = Record<string, unknown>> {
  id: string;
  type: JobType;
  payload: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
}

class BackgroundQueueService {
  private jobs: Map<string, BackgroundJob> = new Map();
  private isProcessing = false;

  constructor() {
    // Seed initial recurring monitoring jobs
    this.addJob('CHECK_LOW_STOCK_ALERTS', { warehouse: 'Vilnius Main Hub' });
    this.addJob('AGGREGATE_HOURLY_ANALYTICS', { period: 'hourly' });
  }

  /**
   * Enqueue a new background job.
   */
  public addJob<T extends Record<string, unknown>>(
    type: JobType, 
    payload: T, 
    maxAttempts = 3
  ): BackgroundJob<T> {
    const job: BackgroundJob<T> = {
      id: 'job-' + crypto.randomUUID().slice(0, 8),
      type,
      payload,
      status: 'PENDING',
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(job.id, job as unknown as BackgroundJob);
    // Trigger async processing loop
    setTimeout(() => this.processNext(), 50);
    return job;
  }

  /**
   * Process pending jobs in background.
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      for (const job of this.jobs.values()) {
        if (job.status === 'PENDING' || job.status === 'RETRYING') {
          job.status = 'RUNNING';
          job.attempts += 1;
          job.processedAt = new Date().toISOString();

          try {
            // Simulated worker execution
            await new Promise(res => setTimeout(res, 40));
            job.status = 'COMPLETED';
            job.completedAt = new Date().toISOString();
          } catch (err) {
            job.error = err instanceof Error ? err.message : 'Job execution failed';
            if (job.attempts < job.maxAttempts) {
              job.status = 'RETRYING';
            } else {
              job.status = 'FAILED';
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Return job queue metrics and list.
   */
  public getQueueStats() {
    const all = Array.from(this.jobs.values());
    return {
      total: all.length,
      pending: all.filter(j => j.status === 'PENDING').length,
      running: all.filter(j => j.status === 'RUNNING').length,
      completed: all.filter(j => j.status === 'COMPLETED').length,
      failed: all.filter(j => j.status === 'FAILED').length,
      recentJobs: all.slice(-15).reverse()
    };
  }

  /**
   * Retry failed job manually from admin console.
   */
  public retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'PENDING';
    job.attempts = 0;
    job.error = undefined;
    setTimeout(() => this.processNext(), 10);
    return true;
  }
}

export const backgroundQueue = new BackgroundQueueService();
