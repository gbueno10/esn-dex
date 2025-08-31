/**
 * Get the base URL for the application
 * Uses environment variable if available, otherwise falls back to window.location.origin
 */
export function getBaseUrl(): string {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  
  // Client-side: use environment variable or current origin
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

/**
 * Generate QR code URL for a user profile
 */
export function generateProfileQRUrl(userId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/unlock/${userId}`;
}

/**
 * Generate QR code image URL using external service
 */
export function generateQRCodeImageUrl(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
