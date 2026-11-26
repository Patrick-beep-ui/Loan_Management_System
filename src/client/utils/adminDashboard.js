function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function roundAmount(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isPaid(status) {
  return String(status).toLowerCase() === "paid";
}

function getLoanId(payment) {
  return (
    payment.InstallmentPayment?.LoanInstallment?.loan_id ??
    payment.LoanInterestPayment?.loan_id ??
    null
  );
}

function paymentTargetLabel(payment) {
  const installment = payment.InstallmentPayment?.LoanInstallment;
  return installment
    ? `Installment #${installment.installment_number}`
    : "Ordinary interest";
}

function isOverdue(installment, now) {
  if (isPaid(installment.status) || !installment.due_date) return false;

  const dueDate = new Date(installment.due_date);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function monthKey(paidAt) {
  if (!paidAt) return "";

  const date = new Date(paidAt);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function paidAtTime(payment) {
  const time = new Date(payment.paid_at).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function buildMonthlyPayments(payments, limit = 6) {
  const grouped = new Map();

  for (const payment of asArray(payments)) {
    const key = monthKey(payment.paid_at);
    if (!key) continue;

    const entry = grouped.get(key) || {
      key,
      label: monthLabel(key),
      count: 0,
      amount: 0,
    };

    entry.count += 1;
    entry.amount = roundAmount(entry.amount + toNumber(payment.amount));
    grouped.set(key, entry);
  }

  return [...grouped.values()]
    .sort((left, right) => left.key.localeCompare(right.key))
    .slice(-limit);
}

export function buildRecentPayments(payments, limit = 5) {
  return [...asArray(payments)]
    .sort(
      (left, right) =>
        paidAtTime(right) - paidAtTime(left) ||
        Number(right.payment_id) - Number(left.payment_id),
    )
    .slice(0, limit)
    .map((payment) => ({
      ...payment,
      loanId: getLoanId(payment),
      targetLabel: paymentTargetLabel(payment),
    }));
}

export function buildAdminDashboardData({ loans = [], payments = [] } = {}) {
  const loanList = asArray(loans);
  const paymentList = asArray(payments);
  const now = new Date();
  const lenderIds = new Set();
  const customerIds = new Set();

  let totalLoanAmount = 0;
  let totalToPay = 0;
  let totalInstallments = 0;
  let paidInstallmentCount = 0;
  let pendingInstallmentCount = 0;
  let overdueInstallmentCount = 0;
  let includedInterestLoans = 0;
  let separateInterestLoans = 0;
  let separateInterestPaid = 0;
  let separateInterestPending = 0;

  for (const loan of loanList) {
    totalLoanAmount = roundAmount(
      totalLoanAmount + toNumber(loan.loan_amount),
    );
    totalToPay = roundAmount(
      totalToPay + toNumber(loan.total_to_pay ?? loan.loan_amount),
    );

    if (loan.lender_id !== null && loan.lender_id !== undefined) {
      lenderIds.add(loan.lender_id);
    }

    if (loan.customer_id !== null && loan.customer_id !== undefined) {
      customerIds.add(loan.customer_id);
    }

    if (loan.interest_payment_mode === "separate") {
      separateInterestLoans += 1;
    } else {
      includedInterestLoans += 1;
    }

    for (const installment of asArray(loan.installments)) {
      totalInstallments += 1;

      if (isPaid(installment.status)) {
        paidInstallmentCount += 1;
      } else {
        pendingInstallmentCount += 1;
      }

      if (isOverdue(installment, now)) {
        overdueInstallmentCount += 1;
      }
    }

    const interest = loan.interestPayment;

    if (loan.interest_payment_mode === "separate" && interest) {
      if (isPaid(interest.status) || interest.payment_id != null) {
        separateInterestPaid += 1;
      } else {
        separateInterestPending += 1;
      }
    }
  }

  const paidAmount = roundAmount(
    paymentList.reduce((sum, payment) => sum + toNumber(payment.amount), 0),
  );

  const metrics = {
    loanCount: loanList.length,
    paymentCount: paymentList.length,
    lenderCount: lenderIds.size,
    customerCount: customerIds.size,
    totalLoanAmount,
    totalToPay,
    paidAmount,
    outstandingAmount: roundAmount(Math.max(0, totalToPay - paidAmount)),
    totalInstallments,
    paidInstallmentCount,
    pendingInstallmentCount,
    overdueInstallmentCount,
    includedInterestLoans,
    separateInterestLoans,
    separateInterestPaid,
    separateInterestPending,
  };

  return {
    metrics,
    monthlyPayments: buildMonthlyPayments(paymentList),
    recentPayments: buildRecentPayments(paymentList),
  };
}
