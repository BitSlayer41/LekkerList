import { Button } from "antd";
import { NEXT_STATUS_MAP, STATUS_LABELS } from "../../orderStatusFlow";

export default function StatusBtn({
  role,
  currentStatus,
  allowedRole,
  onChangeStatus,
  loading,
}) {
  const nextStatus = NEXT_STATUS_MAP[currentStatus];

  if (!nextStatus) return null;

  if (role !== allowedRole) return null;

  return (
    <Button
      type="primary"
      onClick={() => onChangeStatus(nextStatus)}
      loading={loading}
    >
      {STATUS_LABELS[nextStatus]}
    </Button>
  );
}
