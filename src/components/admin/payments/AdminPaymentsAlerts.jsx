import ErrorAlert from "@/components/loans/create/ErrorAlert";
import PaymentSuccessAlert from "@/components/payments/PaymentSuccessAlert";

export default function AdminPaymentsAlerts({
  error,
  success,
  revertSuccess,
  onDismissError,
  onDismissSuccess,
  onDismissRevertSuccess,
}) {
  return (
    <>
      <PaymentSuccessAlert
        visible={Boolean(success)}
        message={success}
        onDismiss={onDismissSuccess}
      />
      <PaymentSuccessAlert
        visible={Boolean(revertSuccess)}
        message={revertSuccess}
        onDismiss={onDismissRevertSuccess}
      />
      <ErrorAlert message={error} />
    </>
  );
}
