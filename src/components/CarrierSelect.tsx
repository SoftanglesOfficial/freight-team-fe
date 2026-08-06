import { Autocomplete, AutocompleteProps } from "@mantine/core";
import { KeyboardEvent, useMemo } from "react";

const CARRIERS = [
  "A. Duie Pyle",
  "AAA Cooper",
  "ABF Freight",
  "ACE Transport",
  "ACI motor Freight",
  "Best Overnite",
  "Central Transport",
  "Custom Co.",
  "Daylight",
  "Dayton Freight",
  "DDDP",
  "Dohrn Transfer",
  "Dugan Truck Lines",
  "EDI Express",
  "Estes",
  "Fedex Economy",
  "Fedex Priority",
  "Fedex Freight",
  "Fedex Ground",
  "Glovalink",
  "Roadrunner",
  "R&L Carriers",
  "TOTAL Transport",
  "Local Regional Carrier",
  "XPO Logistics",
  "T-Force",
  "Ward Trucking",
  "Southeastern Freight Lines",
  "Saia",
  "Old Dominion",
  "Forward Air",
  "Pitt Ohio",
  "Full Truckload",
  "Partial Truckload",
  "Other",
];

function acronym(name: string) {
  return name
    .split(/[\s&.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toLowerCase();
}

/** Best match for typed text / initials (e.g. "od" → Old Dominion). */
export function bestCarrierMatch(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exact = CARRIERS.find((c) => c.toLowerCase() === q);
  if (exact) return exact;

  const starts = CARRIERS.filter((c) => c.toLowerCase().startsWith(q));
  if (starts.length === 1) return starts[0];
  if (starts.length > 1) {
    starts.sort((a, b) => a.length - b.length);
    return starts[0];
  }

  const byAcronym = CARRIERS.filter((c) => acronym(c).startsWith(q));
  if (byAcronym.length === 1) return byAcronym[0];
  if (byAcronym.length > 1) {
    byAcronym.sort((a, b) => a.length - b.length);
    return byAcronym[0];
  }

  const includes = CARRIERS.filter((c) => c.toLowerCase().includes(q));
  if (includes.length) {
    includes.sort((a, b) => a.length - b.length);
    return includes[0];
  }

  return null;
}

interface CarrierSelectProps extends Omit<AutocompleteProps, "data"> {
  data?: never;
}

const CarrierSelect = ({ onChange, onKeyDown, value, ...props }: CarrierSelectProps) => {
  const data = useMemo(() => CARRIERS, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      const current = String(value ?? "");
      const match = bestCarrierMatch(current);
      if (match && match !== current) {
        e.preventDefault();
        onChange?.(match);
      }
    }
    onKeyDown?.(e);
  };

  return (
    <Autocomplete
      data={data}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder="Type to search or enter a carrier"
      {...props}
    />
  );
};

export default CarrierSelect;
export { CARRIERS };
