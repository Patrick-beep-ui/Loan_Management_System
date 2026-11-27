import { Link } from "react-router-dom";

import { useAuth } from "@/client/contexts/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoanListHeader({ description, onCreateLoan }) {
  const { user } = useAuth();
  const isAdmin = user?.Role?.role_name === "admin";

  return (
    <CardHeader>
      <CardTitle className="text-2xl">Loans</CardTitle>
      <CardDescription>{description}</CardDescription>
      <CardAction>
        <div className="flex gap-2">
          {!isAdmin && (
            <Link
              to="/payments"
              className={buttonVariants({ variant: "outline" })}
            >
              Payments
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={buttonVariants({ variant: "outline" })}
            >
              Admin
            </Link>
          )}
          <Button type="button" onClick={onCreateLoan}>
            New loan
          </Button>
        </div>
      </CardAction>
    </CardHeader>
  );
}
