export const OWNER_EMAIL = "apwebventures01@gmail.com";
export const isOwnerEmail = (email?: string | null) => (email ?? "").trim().toLowerCase() === OWNER_EMAIL;
