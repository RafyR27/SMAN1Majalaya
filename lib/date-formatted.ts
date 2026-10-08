export function formatDate(date: Date | string): string {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
