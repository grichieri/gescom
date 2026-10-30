type TabsProps<K extends string> = {
  tabs: { key: K; label: string }[];
  active: K;
  onChange: (key: K) => void;
};

export default function Tabs<K extends string>({ tabs, active, onChange }: TabsProps<K>) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={`-mb-px border-b-2 px-1 pb-3 text-sm font-bold transition-colors ${
            active === t.key ? "border-brand-green text-brand-green" : "border-transparent text-gray-500 hover:text-brand-dark"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
