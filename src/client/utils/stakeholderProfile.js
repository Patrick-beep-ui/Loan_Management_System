import { fullName } from "./loanFormat.js";
import { isInstallmentOverdue } from "./loanStatus.js";

export const STAKEHOLDER_ROLE_LABELS = {
  lender: "Lender",
  customer: "Customer",
  guarantor: "Guarantor",
};

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

function sameId(left, right) {
  if (left === null || left === undefined || right === null || right === undefined) {
    return false;
  }

  return String(left) === String(right);
}

export function getStakeholderLoanRoles(loan, stakeholderId) {
  if (!loan || stakeholderId === null || stakeholderId === undefined) return [];

  const roles = [];

  if (sameId(loan.lender_id, stakeholderId)) roles.push("lender");
  if (sameId(loan.customer_id, stakeholderId)) roles.push("customer");

  const isGuarantor = asArray(loan.guarantors).some(
    (link) =>
      sameId(link.guarantor_stakeholder_id, stakeholderId) ||
      sameId(link.guarantor?.stakeholder_id, stakeholderId),
  );
  if (isGuarantor) roles.push("guarantor");

  return roles;
}

export function buildStakeholderLoanRecords(stakeholderId, loans, now = new Date()) {
  return asArray(loans)
    .map((loan) => {
      const roles = getStakeholderLoanRoles(loan, stakeholderId);
      if (roles.length === 0) return null;

      const installments = asArray(loan.installments);

      return {
        loanId: loan.loan_id,
        roles,
        customer: fullName(loan.customer),
        lender: fullName(loan.lender),
        loanAmount: roundAmount(toNumber(loan.loan_amount)),
        totalToPay: roundAmount(toNumber(loan.total_to_pay ?? loan.loan_amount)),
        disbursedAt: loan.disbursed_at,
        installmentCount: installments.length,
        paidInstallmentCount: installments.filter((installment) =>
          isPaid(installment.status),
        ).length,
        overdueInstallmentCount: installments.filter((installment) =>
          isInstallmentOverdue(installment, now),
        ).length,
      };
    })
    .filter(Boolean)
    .sort((left, right) => Number(right.loanId) - Number(left.loanId));
}

export function buildStakeholderProfile({
  stakeholder,
  loans = [],
  users = [],
  now = new Date(),
} = {}) {
  const stakeholderId = stakeholder?.stakeholder_id;
  const loanRecords = buildStakeholderLoanRecords(stakeholderId, loans, now);
  const linkedUser =
    asArray(users).find((user) => sameId(user.stakeholder_id, stakeholderId)) ||
    null;

  const roleCounts = { lender: 0, customer: 0, guarantor: 0 };
  for (const record of loanRecords) {
    for (const role of record.roles) roleCounts[role] += 1;
  }

  return {
    stakeholder,
    displayName: fullName(stakeholder),
    access: linkedUser
      ? {
          userId: linkedUser.user_id,
          email: linkedUser.email,
          roleName: linkedUser.Role?.role_name || "—",
          isActive: linkedUser.is_active,
          mustChangePassword: Boolean(linkedUser.must_change_password),
        }
      : null,
    loanRecords,
    loanCount: loanRecords.length,
    roleCounts,
    totalLoanAmount: roundAmount(
      loanRecords.reduce((sum, record) => sum + record.loanAmount, 0),
    ),
    totalToPay: roundAmount(
      loanRecords.reduce((sum, record) => sum + record.totalToPay, 0),
    ),
  };
}

export function buildStakeholderSummaries({
  stakeholders = [],
  loans = [],
  users = [],
  limit,
  now = new Date(),
} = {}) {
  const summaries = asArray(stakeholders).map((stakeholder) => {
    const profile = buildStakeholderProfile({ stakeholder, loans, users, now });

    return {
      stakeholderId: stakeholder.stakeholder_id,
      name: profile.displayName,
      loanCount: profile.loanCount,
      roleCounts: profile.roleCounts,
      totalToPay: profile.totalToPay,
    };
  });

  summaries.sort(
    (left, right) =>
      right.loanCount - left.loanCount || left.name.localeCompare(right.name),
  );

  return typeof limit === "number" ? summaries.slice(0, limit) : summaries;
}
