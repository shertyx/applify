// Fallback: city name (lowercase) → FT department code
// Used when ville field contains raw names without postal codes.
const CITY_TO_DEPT = {
  "paris": "75", "marseille": "13", "lyon": "69", "toulouse": "31",
  "nice": "06", "nantes": "44", "montpellier": "34", "strasbourg": "67",
  "bordeaux": "33", "lille": "59", "rennes": "35", "reims": "51",
  "saint-étienne": "42", "toulon": "83", "le havre": "76", "grenoble": "38",
  "dijon": "21", "angers": "49", "nîmes": "30", "villeurbanne": "69",
  "clermont-ferrand": "63", "aix-en-provence": "13", "brest": "29",
  "tours": "37", "amiens": "80", "limoges": "87", "rouen": "76",
  "metz": "57", "nancy": "54", "perpignan": "66", "caen": "14",
  "orléans": "45", "mulhouse": "68", "besançon": "25",
  "valenciennes": "59", "pau": "64", "avignon": "84", "dunkerque": "59",
  "lorient": "56", "poitiers": "86", "la rochelle": "17",
  "roubaix": "59", "tourcoing": "59", "montreuil": "93",
  "saint-denis": "93", "argenteuil": "95", "colmar": "68",
  "bayonne": "64", "troyes": "10", "versailles": "78",
  "nanterre": "92", "créteil": "94", "vitry-sur-seine": "94",
  "saint-nazaire": "44", "calais": "62", "cannes": "06",
  "antibes": "06", "mérignac": "33", "pessac": "33",
};

// Extract 5-digit postal codes from the stored ville string.
// Handles "Paris - 75001" (autocomplete format) and raw "75001" (legacy).
function extractPostalCodes(villeStr) {
  if (!villeStr?.trim()) return [];
  return villeStr.split(",")
    .map((s) => s.trim().match(/\d{5}/)?.[0])
    .filter(Boolean);
}

// Extract unique FT department codes from the stored ville string.
// 1. Try to extract postal codes (5 digits) → derive dept
// 2. Fallback: match city name against CITY_TO_DEPT lookup
export function getDeptsFromPostalCodes(villeStr) {
  if (!villeStr?.trim()) return [];
  const segments = villeStr.split(",").map((s) => s.trim()).filter(Boolean);
  const depts = new Set();

  for (const seg of segments) {
    const pc = seg.match(/\d{5}/)?.[0];
    if (pc) {
      // Derive dept from postal code
      if (pc.startsWith("971") || pc.startsWith("972") || pc.startsWith("973") ||
          pc.startsWith("974") || pc.startsWith("976")) { depts.add(pc.slice(0, 3)); continue; }
      if (pc >= "20000" && pc <= "20190") { depts.add("2A"); continue; }
      if (pc >= "20200" && pc <= "20999") { depts.add("2B"); continue; }
      depts.add(pc.slice(0, 2));
    } else {
      // No postal code — try city name fallback (strip "- CP" suffix if present)
      const cityName = seg.split(" - ")[0].trim().toLowerCase();
      const dept = CITY_TO_DEPT[cityName];
      if (dept) depts.add(dept);
    }
  }

  return [...depts];
}

// Returns the location string for JSearch / Google Jobs queries.
export function getLocationLabel(villeStr) {
  if (!villeStr?.trim()) return "France";
  const labels = villeStr.split(",")
    .map((s) => s.trim().split(" - ")[0].trim())
    .filter(Boolean);
  return labels.slice(0, 2).join(", ") + ", France";
}
