export function parseBrokers(brokers: string): string[] {
  return brokers
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}
