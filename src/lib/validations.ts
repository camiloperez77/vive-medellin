import { z } from 'zod';
import { EventCategory, AdditionalService } from '@/types';
import { isValidDateFormat, isValidTimeFormat, isFutureDateTime, isValidEmail, isValidColombianPhone } from '@/utils';

// Esquema para ubicación del evento
export const eventLocationSchema = z.object({
  direccion_completa: z.string()
    .min(10, 'La dirección debe incluir al menos comuna y nombre del lugar')
    .regex(/comuna\s+\d+/i, 'La dirección debe incluir la comuna'),
  comuna_barrio: z.string()
    .min(3, 'Ingrese la comuna o barrio'),
  direccion_detallada: z.string()
    .min(5, 'Ingrese la dirección completa'),
  enlace_mapa: z.string()
    .url('Ingrese una URL válida')
    .optional()
    .or(z.literal(''))
});

// Esquema para organizador del evento
export const eventOrganizerSchema = z.object({
  nombre: z.string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  celular: z.string()
    .refine(isValidColombianPhone, 'Ingrese un número de celular válido (10 dígitos, iniciando con 3)'),
  identificacion: z.string()
    .min(6, 'La identificación debe tener al menos 6 caracteres')
    .max(20, 'La identificación no puede exceder 20 caracteres'),
  email: z.string()
    .email('Ingrese un correo electrónico válido')
    .refine(isValidEmail, 'El formato del correo no es válido')
});

// Esquema principal para crear/editar evento
export const createEventSchema = z.object({
  titulo: z.string()
    .min(5, 'El título debe tener entre 5 y 100 caracteres')
    .max(100, 'El título debe tener entre 5 y 100 caracteres'),
  
  descripcion: z.string()
    .min(20, 'La descripción debe tener entre 20 y 1000 caracteres')
    .max(1000, 'La descripción debe tener entre 20 y 1000 caracteres'),
  
  fecha: z.string()
    .refine(isValidDateFormat, 'Formato de fecha inválido (dd/mm/yyyy)'),
  
  horario: z.string()
    .refine(isValidTimeFormat, 'Formato de hora inválido (HH:mm)'),
  
  ubicacion: eventLocationSchema,
  
  categoria: z.nativeEnum(EventCategory, {
    errorMap: () => ({ message: 'Seleccione una categoría válida' })
  }),
  
  aforo: z.number()
    .min(1, 'El aforo debe ser mayor a 0')
    .max(100000, 'El aforo no puede exceder 100,000 personas'),
  
  destacado: z.boolean(),
  
  valor_ingreso: z.union([
    z.literal('gratuito'),
    z.number().min(0, 'El valor no puede ser negativo')
  ]),
  
  organizador: eventOrganizerSchema,
  
  imagen_caratula: z.union([
    z.instanceof(File)
      .refine((file: File) => file.size <= 5000000, 'La imagen no puede exceder 5MB')
      .refine(
        (file: File) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
        'Solo se permiten archivos JPEG y PNG'
      ),
    z.string().optional()
  ]).optional(),
  
  servicios_adicionales: z.array(z.nativeEnum(AdditionalService))
    .default([])
}).refine(
  (data: any) => isFutureDateTime(data.fecha, data.horario),
  {
    message: 'La fecha y hora del evento debe ser futura',
    path: ['fecha']
  }
);

// Esquema para filtros de búsqueda
export const eventFiltersSchema = z.object({
  categoria: z.nativeEnum(EventCategory).optional(),
  fecha_inicio: z.string()
    .refine((date: string) => !date || isValidDateFormat(date), 'Formato de fecha inválido')
    .optional(),
  fecha_fin: z.string()
    .refine((date: string) => !date || isValidDateFormat(date), 'Formato de fecha inválido')
    .optional(),
  valor_min: z.number().min(0).optional(),
  valor_max: z.number().min(0).optional(),
  comuna: z.string().optional(),
  destacado: z.boolean().optional(),
  gratuito: z.boolean().optional()
}).refine(
  (data: any) => !data.valor_min || !data.valor_max || data.valor_min <= data.valor_max,
  {
    message: 'El valor mínimo no puede ser mayor al máximo',
    path: ['valor_min']
  }
);

// Esquema para búsqueda de eventos
export const eventSearchSchema = z.object({
  query: z.string().optional(),
  filters: eventFiltersSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.enum(['fecha', 'titulo', 'created_at']).default('fecha'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// Esquema para login (simulado)
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// Tipos derivados de los esquemas
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type EventFiltersFormData = z.infer<typeof eventFiltersSchema>;
export type EventSearchFormData = z.infer<typeof eventSearchSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type EventLocationFormData = z.infer<typeof eventLocationSchema>;
export type EventOrganizerFormData = z.infer<typeof eventOrganizerSchema>;