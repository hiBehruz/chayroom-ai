import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  id: number
  telegramId: string
  username: string | null
  fullName: string
  avatar: string | null
  role: 'USER' | 'ADMIN'
}

function secret() {
  const config = useRuntimeConfig()
  return new TextEncoder().encode(config.jwtSecret as string)
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret())
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}
