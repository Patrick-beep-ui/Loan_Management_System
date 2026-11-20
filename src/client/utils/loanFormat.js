export function formatAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
}

export function formatRate(value) {
  if (value === null || value === undefined || value === "") return "—";

  const rate = Number(value);
  return Number.isFinite(rate)
    ? `${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`
    : "—";
}

export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 10);
}

export function fullName(stakeholder) {
  if (!stakeholder) return "—";

  return (
    [stakeholder.first_name, stakeholder.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}
