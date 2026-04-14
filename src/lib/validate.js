// Nettoie les chaînes pour éviter XSS et injections
export function sanitize(str, maxLength = 1000) {
  if (typeof str !== "string") return "";
  return str
    .slice(0, maxLength)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "")
    .trim();
}

export function isValidEmail(email) {
  return typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    email.length <= 254;
}

export function badRequest(message = "Requête invalide") {
  return Response.json({ error: message }, { status: 400 });
}
