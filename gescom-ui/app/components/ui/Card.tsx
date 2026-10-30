type CardProps = {
  title?: string;
  /** Contenido a la derecha del título (botones, enlaces...) */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Card({ title, action, className = "", children }: CardProps) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold text-brand-dark">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
