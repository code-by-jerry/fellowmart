import ImageKit from "@imagekit/nodejs";

let client: ImageKit | null = null;

/**
 * ImageKit client — server-side only. Lazy-init so `next build` does not
 * require secrets at module load time (they are available at runtime on Workers).
 */
export function getImageKitClient(): ImageKit {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing IMAGEKIT_PRIVATE_KEY environment variable");
  }

  if (!client) {
    client = new ImageKit({ privateKey });
  }

  return client;
}
