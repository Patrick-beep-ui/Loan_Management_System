import { Card, CardContent } from "@/components/ui/card";
import LoanCreatedAlert from "@/components/loans/LoanCreatedAlert";
import LoanListHeader from "@/components/loans/LoanListHeader";
import LoanLoadErrorAlert from "@/components/loans/LoanLoadErrorAlert";
import LoanTable from "@/components/loans/LoanTable";
import { useLoans } from "@/client/hooks/useLoans";

export default function Loan() {
  const loanList = useLoans();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
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
          <LoanLoadErrorAlert
            message={loanList.error}
            onRetry={loanList.fetchLoans}
          />
          <LoanTable loans={loanList.loans} loading={loanList.loading} />
        </CardContent>
      </Card>
    </main>
  );
}
