import { useNavigate } from "react-router-dom";

import { useAuth } from "@/client/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function LogoutButton({ className }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
}
