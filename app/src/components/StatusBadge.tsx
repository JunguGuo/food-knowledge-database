import { MenuItemStatus, STATUS_LABELS, STATUS_CLASSES } from "@/lib/types";

export function StatusBadge({ status }: { status: MenuItemStatus }) {
  return (
    <span className={`status-badge ${STATUS_CLASSES[status]}`}>
      <span className="status-dot" />
      {STATUS_LABELS[status]}
    </span>
  );
}
