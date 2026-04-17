// Returns a stable UUID for the current guest, persisted in localStorage.
// Used as the x-guest-id header so server-side rate limiting works per-device
// instead of grouping all guests under ip:unknown.
export function getGuestId() {
  try {
    let id = localStorage.getItem("applify_guest_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("applify_guest_id", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}
