const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isPaid(status) {
  return String(status).toLowerCase() === "paid";
}

function parseDueDate(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (value === null || value === undefined || value === "") return null;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dayNumber(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isInstallmentOverdue(installment, now = new Date()) {
  if (!installment || isPaid(installment.status)) return false;

  const dueDate = parseDueDate(installment.due_date);
  if (!dueDate) return false;

  return dueDate < startOfDay(now);
}

export function daysOverdue(installment, now = new Date()) {
  if (!isInstallmentOverdue(installment, now)) return 0;

  const dueDate = parseDueDate(installment.due_date);
  const difference = dayNumber(startOfDay(now)) - dayNumber(dueDate);

  return Math.round(difference / MS_PER_DAY);
}
