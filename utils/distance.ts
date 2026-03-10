export function distanceLabel(meters: number): string {
  if (meters <= 200) return "Very close";
  if (meters <= 500) return "Nearby";
  if (meters <= 1000) return "~1km away";
  if (meters <= 2000) return "~2km away";
  if (meters <= 3000) return "~3km away";
  return "Far away";
}
