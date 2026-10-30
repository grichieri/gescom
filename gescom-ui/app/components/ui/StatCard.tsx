import { Link } from "react-router";

type StatCardProps = {
  label: string;
  value: number | string;
  tone?: "red" | "orange" | "green" | "gray";
  /** Si se indica, la tarjeta es un enlace a esa ruta (por ejemplo, a un listado ya filtrado) */
  to?: string;
};

const tones = {
  red: "text-red-500",
  orange: "text-orange-500",
  green: "text-brand-green",
  gray: "text-brand-dark",
};

export default function StatCard({ label, value, tone = "gray", to }: StatCardProps) {
  const className = "block rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm";
  const content = (
    <>
      <p className={`text-3xl font-bold ${tones[tone]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
    </>
  );

  return to ? (
    <Link
      to={to}
      className={`${className} transition-shadow hover:border-brand-green hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green`}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
