import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyTributeSignature(rawBody: string, signature: string, apiKey: string): boolean {
  if (!signature || !apiKey) return false

  const expected = createHmac('sha256', apiKey).update(rawBody).digest('hex')
  if (expected.length !== signature.length) return false

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}
