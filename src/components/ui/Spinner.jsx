export default function Spinner({ size = "md" }) {
  const dim = size === "sm" ? "w-4 h-4 border-2" : size === "lg" ? "w-10 h-10 border-[3px]" : "w-6 h-6 border-2";
  return (
    <span
      className={`inline-block ${dim} border-green-200 border-t-green-700 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
