export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Invalid S3 URL:', url);
    return null;
  }
}
