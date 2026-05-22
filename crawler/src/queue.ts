// crawler/src/queue.ts
// p-queue v9 is ESM-only — load via dynamic import in a CommonJS context.
// The queue is initialized lazily; call initQueue() at startup before accepting requests.

import type PQueueClass from 'p-queue'

// Resolved queue instance — initialized in initQueue(), called before first use
let _queue: InstanceType<typeof PQueueClass> | null = null

/**
 * Returns the p-queue instance, initializing it on first call.
 * Safe to call multiple times — subsequent calls return the cached instance.
 */
export async function getQueue(): Promise<InstanceType<typeof PQueueClass>> {
  if (_queue) return _queue
  const { default: PQueue } = await import('p-queue')
  _queue = new PQueue({ concurrency: 1 }) // D-23: one job at a time
  return _queue
}

/**
 * Synchronous accessor — only safe after initQueue() has resolved.
 * Throws if called before initQueue().
 */
export function queue(): InstanceType<typeof PQueueClass> {
  if (!_queue) throw new Error('[queue] Not initialized — call initQueue() before use')
  return _queue
}

/**
 * Initializes the p-queue instance. Must be called once at service startup
 * before the first request arrives at /crawl.
 */
export async function initQueue(): Promise<void> {
  await getQueue()
}
