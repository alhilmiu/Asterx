
import PocketBase from "pocketbase";

const backendUrl =
  import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";

export const pb = new PocketBase(backendUrl);

export function getCurrentUser() {
  return pb.authStore.record;
}

export function hasRole(allowedRoles = []) {
  const user = getCurrentUser();

  return Boolean(user && allowedRoles.includes(user.role));
}
