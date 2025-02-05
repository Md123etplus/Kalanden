import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getUserLocation(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    return data.city || data.country_name || "Unknown"
  } catch (error) {
    console.error("Error fetching user location:", error)
    return "Unknown"
  }
}

