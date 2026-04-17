// Extract unique France Travail department codes from a comma-separated
// string of French postal codes (e.g. "75001,59000" → ["75","59"]).
// Special cases: Corsica (20xxx → 2A/2B), DOM-TOM (97x → 3 digits).
export function getDeptsFromPostalCodes(villeStr) {
  if (!villeStr?.trim()) return [];
  const codes = villeStr.split(",").map((s) => s.trim()).filter((s) => /^\d{5}$/.test(s));
  const depts = [...new Set(codes.map((pc) => {
    if (pc.startsWith("971") || pc.startsWith("972") || pc.startsWith("973") ||
        pc.startsWith("974") || pc.startsWith("976")) return pc.slice(0, 3);
    if (pc >= "20000" && pc <= "20190") return "2A";
    if (pc >= "20200" && pc <= "20999") return "2B";
    return pc.slice(0, 2);
  }))];
  return depts;
}

// Returns the location string for JSearch / Google Jobs queries.
// Uses the postal codes themselves for better matching.
export function getLocationLabel(villeStr) {
  if (!villeStr?.trim()) return "France";
  const codes = villeStr.split(",").map((s) => s.trim()).filter(Boolean);
  return codes.slice(0, 2).join(", ") + ", France";
}
