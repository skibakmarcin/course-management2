export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h} hour${h > 1 ? 's' : ''} ` : ''}${m} minute${m !== 1 ? 's' : ''}`.trim();
} 