import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL);

export const wakiliQueue = new Queue("wakili", { connection });
export const wakiliEvents = new QueueEvents("wakili", { connection });

export function addJob(name: string, data: unknown, opts?: JobsOptions) {
  return wakiliQueue.add(name, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 500 },
    ...opts,
  });
}

export function startWorker(
  processor: (name: string, data: any) => Promise<void>
) {
  const worker = new Worker(
    "wakili",
    async (job) => {
      await processor(job.name, job.data);
    },
    { connection }
  );

  worker.on("failed", (job, err) =>
    console.error("Job failed", job?.name, err)
  );
  return worker;
}
