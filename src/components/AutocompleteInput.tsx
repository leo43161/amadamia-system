"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
// Importamos el servicio (asegurate que la ruta sea correcta)
import { getProductTypes } from "@/services/products" 

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<string[]>([]) // Lista completa desde API
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([])
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // 1. Cargar tipos desde la base de datos al montar el componente
  React.useEffect(() => {
    async function loadTypes() {
        try {
            const types = await getProductTypes()
            setSuggestions(types)
        } catch (error) {
            console.error("Error cargando tipos de ropa", error)
        }
    }
    loadTypes()
  }, [])

  // 2. Filtrar basado en lo que escribe el usuario
  React.useEffect(() => {
    if (value) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(suggestions)
    }
  }, [value, suggestions]) // Dependencia 'suggestions' agregada

  // ... (El resto del código: handleClickOutside, handleInputChange, etc. queda IGUAL)
  
  // Cerrar dropdown cuando se hace click afuera
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setIsOpen(true)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100",
                value === suggestion && "bg-slate-50"
              )}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}