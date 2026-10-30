import { useState } from "react";
import { cities, provinces } from "~/data/seed";
import FieldShell, { controlClasses } from "./FieldShell";
import SelectField from "./SelectField";

type Location = { provinceId: string; cityId: string };

type CityProvinceFieldsProps = Location & {
  onChange: (next: Location) => void;
  errors?: { provinceId?: string; cityId?: string };
};

const provinceOptions = provinces.map((p) => ({ value: String(p.provinceId), label: p.name }));
const provinceName = (provinceId: number) => provinces.find((p) => p.provinceId === provinceId)?.name ?? "";
const MAX_SUGGESTIONS = 8;

/**
 * Ciudad y provincia enlazadas:
 *  - la ciudad se escribe y se elige de una lista de sugerencias ("Ciudad (Provincia)");
 *  - al elegirla, la provincia se rellena sola (en la base de datos solo se guarda la ciudad);
 *  - si antes se elige una provincia, las sugerencias se limitan a sus municipios.
 */
export default function CityProvinceFields({ provinceId, cityId, onChange, errors }: CityProvinceFieldsProps) {
  const initialName = cities.find((c) => String(c.cityId) === cityId)?.name ?? "";
  const [text, setText] = useState(initialName);

  // Dato derivado: las sugerencias salen del texto escrito y de la provincia; no son estado
  const query = text.trim().toLowerCase();
  const suggestions =
    cityId === "" && query.length >= 2
      ? cities
          .filter((c) => (provinceId === "" || String(c.provinceId) === provinceId) && c.name.toLowerCase().includes(query))
          .slice(0, MAX_SUGGESTIONS)
      : [];

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (cityId !== "") onChange({ provinceId, cityId: "" }); // al editar, hay que volver a elegir
  };

  const pick = (id: number, province: number, name: string) => {
    setText(name);
    onChange({ provinceId: String(province), cityId: String(id) });
  };

  const handleProvince = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    const keep = cityId !== "" && cities.find((c) => String(c.cityId) === cityId)?.provinceId === Number(next);
    onChange({ provinceId: next, cityId: keep ? cityId : "" });
    if (!keep) setText("");
  };

  return (
    <>
      <div className="relative">
        <FieldShell id="campo-ciudad" label="Ciudad" error={errors?.cityId} hint="Escribe para buscar y elige una opción">
          <input
            id="campo-ciudad"
            value={text}
            onChange={handleText}
            autoComplete="off"
            placeholder="Ej: Málaga"
            aria-invalid={errors?.cityId ? true : undefined}
            className={controlClasses(errors?.cityId)}
          />
        </FieldShell>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-lg">
            {suggestions.map((c) => (
              <li key={c.cityId}>
                <button
                  type="button"
                  onClick={() => pick(c.cityId, c.provinceId, c.name)}
                  className="block w-full px-3 py-2 text-left hover:bg-brand-bg"
                >
                  {c.name} <span className="text-gray-500">({provinceName(c.provinceId)})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SelectField
        label="Provincia"
        placeholder="Selecciona"
        options={provinceOptions}
        value={provinceId}
        onChange={handleProvince}
        error={errors?.provinceId}
        hint="Se rellena al elegir la ciudad"
      />
    </>
  );
}
