// Tipos principales de la aplicación

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface Pet {
  id: string
  name: string
  type: "perro" | "gato" | "conejo" | "ave" | "hamster" | "cobayo" | "tortuga" | "pez" | "iguana" | "hurón" | "chinchilla" | "otros"
  breed?: string
  age?: string
  location: string
  description: string
  image?: string
  status: "adopcion" | "rescate" | "cuidados" | "temporal" | "adoptado"
  urgent: boolean
  contact: string
  lat: number
  lng: number
  userId: string
  userName?: string
  userEmail?: string
  createdAt: string
  updatedAt: string
}

export interface Stats {
  totalPets: number
  urgentPets: number
  adoptionPets: number
  rescuePets: number
  totalUsers: number
  recentPets: number
  successfulAdoptions: number
  petsByType: Array<{ _id: string; count: number }>
  petsByLocation: Array<{ _id: string; count: number }>
}

export interface PetsResponse {
  pets: Pet[]
  total: number
  page: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

// Tipos para formularios
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface PetForm {
  name: string
  type: string
  breed: string
  age: string
  location: string
  description: string
  status: string
  urgent: boolean
  contact: string
  image?: string
}
