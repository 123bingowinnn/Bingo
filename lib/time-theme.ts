export type TimeTheme = "dawn" | "day" | "dusk" | "night";

export function pickTimeTheme(date: Date = new Date()): TimeTheme {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "dawn";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 22) return "dusk";
  return "night";
}

export const themeIcon: Record<TimeTheme, string> = {
  dawn: "🌅",
  day: "🌞",
  dusk: "🌆",
  night: "🌙",
};
