import { fullName } from "./loanFormat.js";
import { getStakeholderLoanRoles } from "./stakeholderProfile.js";

const ROLE_ORDER = ["lender", "customer", "guarantor"];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sameId(left, right) {
  if (left === null || left === undefined || right === null || right === undefined) {
    return false;
  }

  return String(left) === String(right);
}

function guarantorIds(loan) {
  return asArray(loan.guarantors)
    .map(
      (link) =>
        link.guarantor_stakeholder_id ?? link.guarantor?.stakeholder_id ?? null,
    )
    .filter((id) => id !== null && id !== undefined);
}

export function buildLenderStakeholders({
  stakeholders = [],
  loans = [],
  ownStakeholderId = null,
} = {}) {
  const loanList = asArray(loans);
  const ownId =
    ownStakeholderId === null || ownStakeholderId === undefined
      ? (loanList[0]?.lender_id ?? null)
      : ownStakeholderId;

  const stakeholderById = new Map(
    asArray(stakeholders)
      .filter((stakeholder) => stakeholder.stakeholder_id !== null && stakeholder.stakeholder_id !== undefined)
      .map((stakeholder) => [String(stakeholder.stakeholder_id), stakeholder]),
  );

  const grouped = new Map();

  for (const loan of loanList) {
    if (loan.loan_id === null || loan.loan_id === undefined) continue;

    const relatedIds = [loan.customer_id, ...guarantorIds(loan)];

    for (const stakeholderId of relatedIds) {
      if (sameId(stakeholderId, ownId)) continue;

      const key = String(stakeholderId);
      if (!grouped.has(key)) {
        grouped.set(key, {
          stakeholderId,
          loanIds: new Set(),
          roles: new Set(),
        });
      }

      const row = grouped.get(key);
      row.loanIds.add(loan.loan_id);

      for (const role of getStakeholderLoanRoles(loan, stakeholderId)) {
        row.roles.add(role);
      }
    }
  }

  return [...grouped.values()]
    .map(({ stakeholderId, loanIds, roles }) => {
      const stakeholder =
        stakeholderById.get(String(stakeholderId)) || null;
      const name = stakeholder
        ? fullName(stakeholder)
        : `Stakeholder #${stakeholderId}`;
      const sortedLoanIds = [...loanIds].sort(
        (left, right) => Number(right) - Number(left),
      );

      return {
        stakeholderId,
        name,
        nationalId: stakeholder?.national_id || "—",
        occupation: stakeholder?.occupation || "—",
        roles: [...roles].sort(
          (left, right) => ROLE_ORDER.indexOf(left) - ROLE_ORDER.indexOf(right),
        ),
        loanIds: sortedLoanIds,
        loanCount: sortedLoanIds.length,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}
