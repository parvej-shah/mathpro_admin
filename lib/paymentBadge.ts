/**
 * Payment Audit Log Badge Logic
 * Manages the red glowing badge for new payment audit logs using localStorage
 */

const STORAGE_KEY = "payment_audit_log_latest_timestamp";

/**
 * Get the latest payment audit log timestamp from localStorage
 */
export function getLatestPaymentTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const timestamp = parseInt(stored, 10);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Save the latest payment audit log timestamp to localStorage
 * @param timestamp - The timestamp to save (should be the latest log's timestamp)
 */
export function saveLatestPaymentTimestamp(timestamp: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(timestamp));
}

/**
 * Check if there are new payment audit logs since last visit
 * @param logs - Array of payment audit logs to check
 * @returns true if there are new logs, false otherwise
 */
export function hasNewPayments(
  logs: Array<{ timestamp?: number; created_at?: string }>
): boolean {
  if (!logs || logs.length === 0) return false;

  const latestStored = getLatestPaymentTimestamp();
  if (latestStored === null) return false;

  // Find the most recent log timestamp
  const timestamps = logs
    .map((log) => {
      if (log.timestamp) return log.timestamp;
      if (log.created_at) {
        const date = new Date(log.created_at);
        return date.getTime() / 1000; // Convert to Unix timestamp
      }
      return 0;
    })
    .filter((ts) => ts > 0);

  if (timestamps.length === 0) return false;

  const latestLogTimestamp = Math.max(...timestamps);

  // If the latest log is newer than what we stored, there are new logs
  return latestLogTimestamp > latestStored;
}

/**
 * Update the stored timestamp to the latest payment audit log timestamp
 * This should be called when the user clicks on the payment audit log link
 * @param logs - Array of payment audit logs to get the latest timestamp from
 */
export function updateLatestPaymentTimestamp(
  logs: Array<{ timestamp?: number; created_at?: string }>
): void {
  if (!logs || logs.length === 0) return;

  const timestamps = logs
    .map((log) => {
      if (log.timestamp) return log.timestamp;
      if (log.created_at) {
        const date = new Date(log.created_at);
        return date.getTime() / 1000; // Convert to Unix timestamp
      }
      return 0;
    })
    .filter((ts) => ts > 0);

  if (timestamps.length === 0) return;

  const latestLogTimestamp = Math.max(...timestamps);
  saveLatestPaymentTimestamp(latestLogTimestamp);
}
