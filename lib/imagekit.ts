import ImageKit from '@imagekit/nodejs'

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error('Missing IMAGEKIT_PRIVATE_KEY environment variable')
}

/**
 * Singleton ImageKit client — server-side only.
 * Never import this in client components.
 */
const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

export default imagekit
