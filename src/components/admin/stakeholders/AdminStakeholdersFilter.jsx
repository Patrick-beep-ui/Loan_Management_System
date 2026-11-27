import { Button } from "@/components/ui/button";
import { STAKEHOLDER_CATEGORY_FILTERS } from "@/client/utils/stakeholderCategory";

export default function AdminStakeholdersFilter({ category, counts, onChange }) {
    return (
        <div
            role="group"
            aria-label="Filter stakeholders by type"
            className="flex flex-wrap gap-2"
        >
            {STAKEHOLDER_CATEGORY_FILTERS.map(({ id, label }) => {
                const active = category === id;

                return (
                    <Button
                        key={id}
                        type="button"
                        size="sm"
                        variant={active ? "default" : "outline"}
                        aria-pressed={active}
                        onClick={() => onChange(id)}
                    >
                        {label}
                        <span className="ml-1.5 text-xs opacity-80">
                            {counts[id] ?? 0}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
}
