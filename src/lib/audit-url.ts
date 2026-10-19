import ipaddr from "ipaddr.js";

export function isPublicAddress(address: string) {
  try {
    let parsed = ipaddr.parse(address.replace(/^\[|\]$/g, ""));
    if (parsed.kind() === "ipv6" && "isIPv4MappedAddress" in parsed && parsed.isIPv4MappedAddress()) parsed = parsed.toIPv4Address();
    return parsed.range() === "unicast";
  } catch { return false; }
}

export function publicWebsiteUrl(raw: string): URL {
  const value = raw.trim();
  if (!value || value.length > 2000) throw new Error("Please enter a valid website address.");
  let url: URL;
  try { url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`); }
  catch { throw new Error("Please enter a valid website address."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || (url.port && !["80", "443"].includes(url.port))) throw new Error("Use a public HTTP or HTTPS address without credentials or a custom port.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const address = hostname.replace(/^\[|\]$/g, "");
  const isIp = ipaddr.isValid(address);
  if (isIp ? !isPublicAddress(address) : (!hostname.includes(".") || /(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(hostname))) throw new Error("That address is not a public website.");
  url.hostname = hostname;
  url.hash = "";
  return url;
}