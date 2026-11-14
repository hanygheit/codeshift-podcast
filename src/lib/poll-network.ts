import { createHmac } from "node:crypto";

/**
 * Keyed, day-scoped hash of the client's network, used only to cap votes per network on
 * always-open polls. Raw IP addresses are never stored, and the daily key rotation means a
 * hash cannot be linked across days. IPv6 clients usually control a whole /64, so the cap
 * applies to the /64 prefix. Behind Cloudflare `cf-connecting-ip` is set by the edge and
 * cannot be supplied by the client.
 */
export function clientNetworkHash(
  request: Request,
  secret: string,
  now: Date = new Date(),
): string | null {
  const header =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0];
  const address = header?.trim().toLowerCase();
  if (!address) return null;
  const day = now.toISOString().slice(0, 10);
  return createHmac("sha256", secret)
    .update(`network:${day}:${networkOf(address)}`)
    .digest("hex");
}

export function networkOf(address: string): string {
  const ipv4 = address.match(/(?:\d{1,3}\.){3}\d{1,3}$/)?.[0];
  if (ipv4 || !address.includes(":")) return ipv4 ?? address;
  const [head = "", tail = ""] = address.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const groups = address.includes("::")
    ? [
        ...headGroups,
        ...Array<string>(Math.max(0, 8 - headGroups.length - tailGroups.length)).fill("0"),
        ...tailGroups,
      ]
    : address.split(":");
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}
