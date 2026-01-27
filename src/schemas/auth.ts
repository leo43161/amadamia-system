import * as z from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es obligatorio" })
    .email({ message: "Ingresa un correo electrónico válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

// Exportamos el tipo inferido para usarlo en el formulario
export type LoginFormValues = z.infer<typeof loginSchema>