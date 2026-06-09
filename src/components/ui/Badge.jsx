const styles = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-yellow-100 text-yellow-800",
  revoked: "bg-red-100 text-red-800",
  admin: "bg-blue-100 text-blue-800",
  officer: "bg-gray-100 text-gray-700",
  member: "bg-purple-100 text-purple-800",
};

export default function Badge({ label, variant }) {
  const cls = styles[variant] || styles[label?.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span className={`${cls} rounded-full px-2 py-1 text-xs font-medium capitalize`}>
      {label}
    </span>
  );
}
