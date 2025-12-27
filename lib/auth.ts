import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { SPANISH_CITIES, DEFAULT_COORDINATES, JWT_CONFIG, BCRYPT_ROUNDS } from "./constants"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_CONFIG.expiresIn,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function getDefaultCoordinates(location: string): { lat: number; lng: number } {
  const locationLower = location.toLowerCase()

  for (const [city, coords] of Object.entries(SPANISH_CITIES)) {
    if (locationLower.includes(city)) {
      return coords
    }
  }

  return DEFAULT_COORDINATES
}
