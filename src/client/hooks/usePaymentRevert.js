import { useState } from "react";

import api from "@/lib/axiosService";

export function usePaymentRevert({ onReverted } = {}) {
  const [target, setTarget] = useState(null);
  const [error, setError] = useState("");
  const [reverting, setReverting] = useState(false);
  const [success, setSuccess] = useState("");

  function open(nextTarget) {
    setSuccess("");
    setError("");
    setTarget(nextTarget);
  }

  function close() {
    if (!reverting) setTarget(null);
  }

  function dismissSuccess() {
    setSuccess("");
  }

  async function notifyReverted() {
    if (!onReverted) return;

    try {
      await onReverted();
    } catch {
      setError("Payment reverted, but the page could not be refreshed.");
    }
  }

  async function confirmRevert() {
    if (!target) return;

    setError("");
    setReverting(true);

    try {
      await api.delete(`/payments/${target.paymentId}`);
      setTarget(null);
      setSuccess(`${target.label} payment reverted.`);
      await notifyReverted();
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to revert the payment. Please try again.",
        );
      }

      if ([404, 409].includes(requestError.response?.status)) {
        await notifyReverted();
      }
    } finally {
      setReverting(false);
    }
  }

  return {
    target,
    error,
    reverting,
    success,
    isOpen: Boolean(target),
    open,
    close,
    dismissSuccess,
    confirmRevert,
  };
}
