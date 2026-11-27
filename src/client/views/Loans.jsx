import { Card, CardContent } from "@/components/ui/card";
import LoanCreatedAlert from "@/components/loans/list/LoanCreatedAlert";
import LoanDeletedAlert from "@/components/loans/list/LoanDeletedAlert";
import LoanListHeader from "@/components/loans/list/LoanListHeader";
import LoanLoadErrorAlert from "@/components/loans/list/LoanLoadErrorAlert";
import LoanTable from "@/components/loans/list/LoanTable";
import { useLoans } from "@/client/hooks/useLoans";

export default function Loan() {
  const loanList = useLoans();

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <LoanListHeader
        description={loanList.description}
        onCreateLoan={loanList.goToCreateLoan}
      />

      <CardContent>
        <LoanCreatedAlert
          visible={loanList.showCreated}
          createdLoanId={loanList.createdLoanId}
          onDismiss={loanList.dismissCreated}
        />
        <LoanDeletedAlert
          visible={loanList.showDeleted}
          deletedLoanId={loanList.deletedLoanId}
          onDismiss={loanList.dismissDeleted}
        />
        <LoanLoadErrorAlert
          message={loanList.error}
          onRetry={loanList.fetchLoans}
        />
        <LoanTable loans={loanList.loans} loading={loanList.loading} />
      </CardContent>
    </Card>
  );
}
