"use client"

import React from "react"
import PhoneInputComponent from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { Label } from "@/components/ui/label"
import { Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  maxLength?: number
}

export function PhoneInput({
  value,
  onChange,
  label = "WhatsApp de contacto",
  required = false,
  disabled = false,
  placeholder = "Ingresa tu número de WhatsApp",
  className,
  maxLength = 20,
}: PhoneInputProps) {
  const handleChange = (phone: string | undefined) => {
    onChange(phone || "")
  }

  // Solo usar el valor si está en formato E.164 válido o está vacío
  const safeValue = value && value.length > 0 
    ? (value.startsWith('+') ? value : '') 
    : value

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex items-center text-sm font-medium text-gray-700">
          <Phone className="w-4 h-4 mr-2" />
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <PhoneInputComponent
          international
          countryCallingCodeEditable={false}
          defaultCountry="CR"
          value={safeValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "phone-input-container"
          )}
        />
      </div>
      
      <p className="text-xs text-gray-500">
        📱 Número de WhatsApp donde las personas interesadas podrán contactarte
        <span className="text-gray-400 ml-2">({(safeValue || '').length}/{maxLength} caracteres)</span>
      </p>

      <style jsx global>{`
        .phone-input-container .PhoneInputInput {
          border: none !important;
          outline: none !important;
          background: transparent !important;
          font-size: 14px !important;
          padding: 0 !important;
        }
        
        .phone-input-container .PhoneInputCountrySelect {
          margin-right: 8px !important;
          border: none !important;
          background: transparent !important;
        }
        
        .phone-input-container .PhoneInputCountrySelectArrow {
          color: hsl(var(--muted-foreground)) !important;
        }
        
        .phone-input-container:focus-within {
          ring: 2px solid hsl(var(--ring)) !important;
        }
        
        .phone-input-container .PhoneInputCountryFlag {
          margin-right: 4px !important;
        }
      `}</style>
    </div>
  )
}
