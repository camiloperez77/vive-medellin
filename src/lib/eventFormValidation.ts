import { z } from 'zod';

// Validación para fechas futuras (permite fechas del mismo día si son en el futuro)
const isFutureDateTime = (fecha: string, hora: string) => {
  if (!fecha || !hora) return false;
  
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);
  
  const eventDateTime = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();
  
  // Permitir eventos del mismo día si la hora es posterior
  return eventDateTime >= now || eventDateTime.toDateString() === now.toDateString();
};



// Esquema completo para el formulario de creación de eventos
export const createEventFormSchema = z.object({
  // Información básica del evento
  titulo: z.string()
    .min(5, 'El título debe tener entre 5 y 100 caracteres')
    .max(100, 'El título debe tener entre 5 y 100 caracteres'),
  
  descripcion: z.string()
    .min(20, 'La descripción debe tener entre 20 y 1000 caracteres')
    .max(1000, 'La descripción debe tener entre 20 y 1000 caracteres'),
  
  categoria: z.string().min(1, 'Debe seleccionar una categoría'),
  
  // Imagen de carátula
  imagenCaratula: z.any().optional(),
  
  // Evento destacado
  destacado: z.boolean().optional().default(false),
  
  // Fecha y hora (formato ISO para inputs)
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().optional(),
  
  // Ubicación
  direccion: z.string().optional(),
  comunaBarrio: z.string().optional(),
  direccionDetallada: z.string().optional(),
  enlaceMapa: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  
  // Modalidad
  modalidad: z.enum(['presencial', 'virtual', 'hibrido']),
  enlaceVirtual: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  
  // Información del evento
  aforo: z.string().optional(),
  valorIngreso: z.string().min(1, 'El valor de ingreso es requerido'),
  
  // Organizador
  nombreOrganizador: z.string().min(1, 'El nombre del organizador es requerido'),
  celularOrganizador: z.string().min(1, 'El número de celular es requerido'),
  identificacionOrganizador: z.string().min(1, 'La identificación es requerida'),
  emailOrganizador: z.string().email('Debe ser un email válido'),
  
  // Servicios adicionales
  serviciosAdicionales: z.array(z.string()).optional().default([]),
  
  // Información adicional
  sitioWeb: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  requisitos: z.string().optional()
}).refine((data) => {
  // Validar fecha y hora futuras
  return isFutureDateTime(data.fechaInicio, data.horaInicio);
}, {
  message: 'La fecha y hora del evento debe ser posterior al momento actual',
  path: ['fechaInicio']
}).refine((data) => {
  // Si es virtual o híbrido, el enlace es requerido
  if (data.modalidad === 'virtual' || data.modalidad === 'hibrido') {
    return data.enlaceVirtual && data.enlaceVirtual.length > 0;
  }
  return true;
}, {
  message: 'El enlace virtual es requerido para eventos virtuales o híbridos',
  path: ['enlaceVirtual']
}).refine((data) => {
  // Si es presencial o híbrido, campos de ubicación requeridos
  if (data.modalidad === 'presencial' || data.modalidad === 'hibrido') {
    return (data.comunaBarrio && data.comunaBarrio.length > 0) || 
           (data.direccionDetallada && data.direccionDetallada.length > 0);
  }
  return true;
}, {
  message: 'Para eventos presenciales debe proporcionar al menos la comuna/barrio o la dirección detallada',
  path: ['comunaBarrio']
});

export type CreateEventFormData = z.infer<typeof createEventFormSchema>;