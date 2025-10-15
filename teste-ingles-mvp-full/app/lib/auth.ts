import { SignJWT, jwtVerify } from 'jose'
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')
export type Role = 'master'|'professor'
export async function createToken(payload: any){
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret)
}
export async function verifyToken<T=any>(token: string){
  try { const { payload } = await jwtVerify(token, secret); return payload as T } catch { return null }
}
