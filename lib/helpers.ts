/**
 * Sort JSON array by serial number
 */
export function sortJsonArrayBySerial<T extends { serial: number }>(
  jsonArray: T[]
): T[] {
  return [...jsonArray].sort((a, b) => {
    const serialA = a.serial;
    const serialB = b.serial;

    if (serialA < serialB) return -1;
    if (serialA > serialB) return 1;
    return 0;
  });
}

/**
 * Convert Unix timestamp to formatted date string
 * Format: "DD MMM, YYYY"
 */
export function unixToFormattedDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
}

/**
 * Change serial number in array and adjust adjacent elements
 */
export function changeSerial<T extends { serial: number }>(
  jsonArray: T[],
  index: number,
  newSerial: number
): T[] {
  const parsedNewSerial = parseInt(String(newSerial), 10);
  const result = [...jsonArray];

  // Update current element
  result[index].serial = parsedNewSerial;

  // Update previous elements
  for (let i = index - 1; i >= 0; i--) {
    const prevSerial = result[i].serial;
    if (isNaN(prevSerial)) break;
    if (prevSerial >= parsedNewSerial) {
      result[i].serial = prevSerial + 1;
    } else {
      break;
    }
  }

  // Update next elements
  for (let i = index + 1; i < result.length; i++) {
    const nextSerial = result[i].serial;
    if (isNaN(nextSerial)) break;
    if (nextSerial <= parsedNewSerial) {
      result[i].serial = nextSerial - 1;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Extract filename from URL
 */
export function fileNameFromUrl(url: string): string {
  const splittedUrl = url.split("/");
  return splittedUrl[splittedUrl.length - 1] || "";
}

/**
 * Format timestamp to readable date string
 */
export function formatTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp || isNaN(timestamp)) {
    return "N/A";
  }

  const date = new Date(timestamp * 1000);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

/**
 * Check if HTML content is empty or contains only whitespace/empty tags
 * Returns true if empty, false if has meaningful content
 */
export function isHtmlEmpty(html: string | null | undefined): boolean {
  if (!html) return true;

  // Remove all HTML tags and check if there's any text content
  const textContent = html
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
    .trim();

  return textContent.length === 0;
}

/**
 * Sanitize HTML content from Lexical editor - returns empty string if content is meaningless
 * This handles empty HTML patterns that Lexical editor outputs when there's no actual content
 * Used throughout the app to normalize descriptions before saving to API
 */
export function sanitizeHtmlContent(html: string | null | undefined): string {
  if (!html || !html.trim()) return "";
  
  const trimmed = html.trim();
  
  // Check for empty HTML patterns from Lexical editor
  const emptyPatterns = [
    "<p></p>",
    "<p><br></p>",
    '<p class="mb-2"></p>',
    '<p class="mb-2"><br></p>',
    "<br>",
    "<br/>",
    "<div></div>",
    "<div><br></div>",
  ];
  
  if (emptyPatterns.includes(trimmed)) {
    return "";
  }
  
  // Also check using text content extraction
  if (isHtmlEmpty(html)) {
    return "";
  }
  
  return html;
}
