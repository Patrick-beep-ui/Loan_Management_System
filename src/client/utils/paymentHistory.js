function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sameId(left, right) {
  return (
    left !== undefined && left !== null && Number(left) === Number(right)
  );
}

export function findInstallmentPayment(payments, installmentId) {
  return (
    asArray(payments).find((payment) =>
      sameId(
        payment.InstallmentPayment?.LoanInstallment?.installment_id,
        installmentId,
      ),
    ) || null
  );
}

export function findInterestPayment(payments, loanId) {
  return (
    asArray(payments).find((payment) =>
      sameId(payment.LoanInterestPayment?.loan_id, loanId),
    ) || null
  );
}
