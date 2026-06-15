/**
 * Thread Badge Logic
 * Manages the red glowing badge for new threads using localStorage
 */

const STORAGE_KEY = "threads_latest_timestamp";

/**
 * Get the latest thread timestamp from localStorage
 */
export function getLatestThreadTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const timestamp = parseInt(stored, 10);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Save the latest thread timestamp to localStorage
 * @param timestamp - The timestamp to save (should be the latest thread's timestamp)
 */
export function saveLatestThreadTimestamp(timestamp: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(timestamp));
}

/**
 * Check if there are new threads since last visit
 * @param threads - Array of threads to check
 * @returns true if there are new threads, false otherwise
 */
export function hasNewThreads(
  threads: Array<{ timestamp: number }>
): boolean {
  if (!threads || threads.length === 0) return false;

  const latestStored = getLatestThreadTimestamp();
  if (latestStored === null) return false;

  // Find the most recent thread timestamp
  const latestThreadTimestamp = Math.max(
    ...threads.map((thread) => thread.timestamp || 0)
  );

  // If the latest thread is newer than what we stored, there are new threads
  return latestThreadTimestamp > latestStored;
}

/**
 * Update the stored timestamp to the latest thread timestamp
 * This should be called when the user clicks on the threads link
 * @param threads - Array of threads to get the latest timestamp from
 */
export function updateLatestThreadTimestamp(
  threads: Array<{ timestamp: number }>
): void {
  if (!threads || threads.length === 0) return;

  const latestThreadTimestamp = Math.max(
    ...threads.map((thread) => thread.timestamp || 0)
  );

  saveLatestThreadTimestamp(latestThreadTimestamp);
}

