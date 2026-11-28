import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminStakeholderProfileHeader({
  name,
  stakeholderId,
  onBack,
}) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">{name}</CardTitle>
      <CardDescription>Stakeholder #{stakeholderId}</CardDescription>
      <CardAction>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          Back to stakeholders
        </Button>
      </CardAction>
    </CardHeader>
  );
}
