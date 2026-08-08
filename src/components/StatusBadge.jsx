export default function StatusBadge({ status }) {
  const map = {
    Paid: "green",
    Accepted: "green",
    Received: "green",
    "Partially Paid": "amber",
    Sent: "amber",
    Draft: "grey",
    Unpaid: "amber",
    Overdue: "red",
    Rejected: "red",
  };
  const cls = map[status] || "grey";
  return <span className={`bb-badge bb-badge-${cls}`}>{status}</span>;
}
