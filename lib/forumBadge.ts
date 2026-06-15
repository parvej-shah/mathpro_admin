/**
 * Forum Badge Logic
 * Manages the red glowing badge for new forum issues using localStorage
 */

const STORAGE_KEY = "forum_latest_issue_timestamp";

/**
 * Get the latest issue timestamp from localStorage
 */
export function getLatestIssueTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const timestamp = parseInt(stored, 10);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Save the latest issue timestamp to localStorage
 * @param timestamp - The timestamp to save (should be the latest issue's timestamp)
 */
export function saveLatestIssueTimestamp(timestamp: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(timestamp));
}

/**
 * Check if there are new issues since last visit
 * @param issues - Array of issues to check
 * @returns true if there are new issues, false otherwise
 */
export function hasNewIssues(issues: Array<{ timestamp: number }>): boolean {
  if (!issues || issues.length === 0) return false;
  
  const latestStored = getLatestIssueTimestamp();
  if (latestStored === null) return false;
  
  // Find the most recent issue timestamp
  const latestIssueTimestamp = Math.max(
    ...issues.map((issue) => issue.timestamp || 0)
  );
  
  // If the latest issue is newer than what we stored, there are new issues
  return latestIssueTimestamp > latestStored;
}

/**
 * Update the stored timestamp to the latest issue timestamp
 * This should be called when the user clicks on the forum link
 * @param issues - Array of issues to get the latest timestamp from
 */
export function updateLatestIssueTimestamp(
  issues: Array<{ timestamp: number }>
): void {
  if (!issues || issues.length === 0) return;
  
  const latestIssueTimestamp = Math.max(
    ...issues.map((issue) => issue.timestamp || 0)
  );
  
  saveLatestIssueTimestamp(latestIssueTimestamp);
}
