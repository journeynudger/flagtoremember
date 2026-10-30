import { request } from "node:https";

/** Preserve the old callback during DNS propagation without following public DNS back here. */
export function legacyStripeActive(until = process.env.FTR_LEGACY_STRIPE_UNTIL, now = Date.now()) {
  const deadline = Date.parse(until || "");
  return Number.isFinite(deadline) && now < deadline;
}

export function forwardLegacyStripe(body: Buffer, signature: string): Promise<{ status: number; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const upstream = request({
      hostname: "flagtoremember.com",
      servername: "flagtoremember.com",
      port: 443,
      family: 4,
      path: "/?callback=gravityformsstripe",
      method: "POST",
      // The existing server's certificate is still verified against its real hostname.
      lookup: (_hostname, _options, callback) => callback(null, "208.87.133.155", 4),
      headers: {
        "content-type": "application/json",
        "content-length": body.length,
        "stripe-signature": signature,
      },
      timeout: 15_000,
    }, response => {
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > 100_000) { response.destroy(new Error("Oversized callback response")); return; }
        chunks.push(chunk);
      });
      response.on("end", () => {
        const status = response.statusCode || 502;
        // Redirects must never be followed or acknowledged as successful delivery.
        resolve({ status: status >= 300 && status < 400 ? 502 : status, body: Buffer.concat(chunks) });
      });
      response.on("error", reject);
    });
    upstream.on("timeout", () => upstream.destroy(new Error("Legacy callback timed out")));
    upstream.on("error", reject);
    upstream.end(body);
  });
}
