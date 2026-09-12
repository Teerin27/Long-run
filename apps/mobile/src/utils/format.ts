export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDistanceKm(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatPaceMinPerKm(meters: number, seconds: number): string {
  if (meters <= 0) {
    return "—";
  }
  const paceSecondsPerKm = seconds / (meters / 1000);
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const secs = Math.round(paceSecondsPerKm % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs} /km`;
}
