// Constantes de la aplicación

export const APP_CONFIG = {
  name: "Safe Haven",
  description: "Tu refugio seguro para adoptar, rescatar y amar",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  developer: {
    name: "Bush Coding",
    url: "https://bushcoding.com",
    slogan: "Bring your ideas to life with Bush Coding",
  },
} as const

export const PET_TYPES = [
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "conejo", label: "Conejo" },
  { value: "ave", label: "Ave" },
  { value: "otros", label: "Otros" },
] as const

export const PET_STATUS = [
  { value: "adopcion", label: "En adopción" },
  { value: "rescate", label: "Necesita rescate" },
  { value: "cuidados", label: "Necesita cuidados médicos" },
  { value: "temporal", label: "Hogar temporal" },
] as const

export const SPANISH_CITIES = {
  madrid: { lat: 40.4168, lng: -3.7038 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  valencia: { lat: 39.4699, lng: -0.3763 },
  sevilla: { lat: 37.3886, lng: -5.9823 },
  zaragoza: { lat: 41.6488, lng: -0.8891 },
  málaga: { lat: 36.7213, lng: -4.4214 },
  murcia: { lat: 37.9922, lng: -1.1307 },
  palma: { lat: 39.5696, lng: 2.6502 },
  bilbao: { lat: 43.2627, lng: -2.9253 },
  alicante: { lat: 38.3452, lng: -0.481 },
} as const

export const DEFAULT_COORDINATES = { lat: 40.4168, lng: -3.7038 } // Madrid

export const PAGINATION = {
  defaultLimit: 50,
  maxLimit: 100,
} as const

export const JWT_CONFIG = {
  expiresIn: "7d",
  cookieName: "token",
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 días en segundos
} as const

export const BCRYPT_ROUNDS = 12

export const VALIDATION = {
  password: {
    minLength: 6,
    maxLength: 128,
  },
  name: {
    maxLength: 100,
  },
  petName: {
    maxLength: 50,
  },
  breed: {
    maxLength: 50,
  },
  age: {
    maxLength: 20,
  },
  location: {
    maxLength: 100,
  },
  description: {
    maxLength: 1000,
  },
} as const
