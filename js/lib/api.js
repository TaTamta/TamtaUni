// Thin client for the two Supabase database functions that hold progress.
// Both check the username and password inside the database.

import { SUPABASE_URL, SUPABASE_KEY } from "../config.js";

async function rpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Database request failed (${response.status})`);
  return response.json();
}

/** Saved progress for this login, or null when the username or password is wrong. */
export const fetchProgress = (username, password) => rpc("get_progress", { u: username, p: password });

/** Resolves true when saved, false when the login was rejected. */
export const saveProgress = (username, password, data) => rpc("save_progress", { u: username, p: password, d: data });
