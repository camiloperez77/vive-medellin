// Enums para categorías y servicios
export enum EventCategory {
  SOCIALES = "Sociales",
  CORPORATIVOS = "Corporativos / Empresariales", 
  ACADEMICOS = "Académicos",
  CULTURALES = "Culturales y Artísticos",
  DEPORTIVOS = "Deportivos",
  COMERCIALES = "Comerciales y de Marca",
  COMUNITARIOS = "Comunitarios o Gubernamentales",
  RELIGIOSOS = "Religiosos",
  TECNOLOGICOS = "Tecnológicos",
  GASTRONOMICOS = "Gastronómicos",
  MEDIOAMBIENTALES = "Medioambientales",
  POLITICOS = "Políticos",
  VIRTUALES = "Virtuales / Híbridos",
  BENEFICOS = "Benéficos / Solidarios",
  INMOBILIARIOS = "Inmobiliarios",
  TURISTICOS = "Turísticos",
  FAMILIARES = "Familiares",
  ADULTOS = "Para adultos"
}

export enum AdditionalService {
  SONIDO = "Sonido",
  ILUMINACION = "Iluminación",
  ESCENARIOS = "Escenarios",
  AUDIOVISUALES = "Audiovisuales",
  DECORACION = "Decoración",
  MOBILIARIO = "Mobiliario",
  CATERING = "Catering",
  BEBIDAS = "Bebidas",
  VAJILLA = "Vajilla y mantelería",
  CARPAS = "Carpas",
  SEGURIDAD = "Seguridad",
  CONTROL_ACCESO = "Control de acceso",
  AMBULANCIA = "Ambulancia o servicio médico",
  COORDINADOR = "Coordinador de eventos",
  DJ = "DJ",
  ANIMADORES = "Animadores",
  ARTISTAS = "Artistas en vivo",
  GENERADORES = "Generadores eléctricos",
  CLIMATIZACION = "Climatización",
  MUSICA = "Música en vivo",
  FOTOGRAFIA = "Fotografía",
  VIDEO = "Video",
  TRANSPORTE = "Transporte de invitados",
  ALOJAMIENTO = "Alojamiento",
  SEGURO = "Seguro de responsabilidad civil",
  INVITACIONES = "Invitaciones",
  BRANDING = "Branding y señalización",
  EXPERIENCIAS = "Experiencias inmersivas",
  ACTIVIDADES = "Actividades interactivas",
  ACCESIBILIDAD = "Acceso para personas con movilidad reducida"
}

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CANCELLED = "cancelled",
  COMPLETED = "completed"
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

// Interfaces principales
export interface EventLocation {
  direccion_completa: string;
  comuna_barrio: string;
  direccion_detallada: string;
  enlace_mapa?: string;
}

export interface EventOrganizer {
  nombre: string;
  celular: string;
  identificacion: string;
  email: string;
}

export interface EventFunction {
  numero_funcion: number;
  fecha: string;
  horario: string;
  status?: EventStatus;
  cancelled_at?: string;
  cancelled_by?: string;
}

export interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horario: string;
  funciones?: EventFunction[];
  ubicacion: EventLocation;
  categoria: EventCategory;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  aforo: number;
  destacado: boolean;
  valor_ingreso: number | "gratuito";
  organizador: EventOrganizer;
  imagen_caratula?: string;
  servicios_adicionales: AdditionalService[];
  status: EventStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  last_edited_by?: string;
  last_edited_at?: string;
  edit_history?: EventEditRecord[];
}

export interface EventFormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  horario: string;
  ubicacion: EventLocation;
  categoria: EventCategory;
  aforo: number;
  destacado: boolean;
  valor_ingreso: number | "gratuito";
  organizador: EventOrganizer;
  imagen_caratula?: File | string;
  servicios_adicionales: AdditionalService[];
}

// Interfaces para filtros y búsqueda
export interface EventFilters {
  categoria?: EventCategory;
  fecha_inicio?: string;
  fecha_fin?: string;
  valor_min?: number;
  valor_max?: number;
  comuna?: string;
  destacado?: boolean;
  gratuito?: boolean;
}

export interface EventSearchParams {
  query?: string;
  filters?: EventFilters;
  page?: number;
  limit?: number;
  sort_by?: 'fecha' | 'titulo' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Interfaces para respuestas de la API
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Interfaces para el usuario/admin
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Interface para el historial de cambios
export interface EventChangeLog {
  id: string;
  event_id: string;
  changed_by: string;
  changed_at: string;
  changes: Record<string, {
    old_value: any;
    new_value: any;
  }>;
  action: 'create' | 'update' | 'cancel';
}

// Interface para el registro de edición de eventos
export interface EventEditRecord {
  edited_by: string;
  edited_at: string;
  changed_fields: string[];
  changes: Record<string, { before: any; after: any }>;
}

// Tipos auxiliares
export type EventCard = Pick<Event, 'id' | 'titulo' | 'fecha' | 'horario' | 'ubicacion' | 'categoria' | 'valor_ingreso' | 'imagen_caratula' | 'destacado'>;

export type EventDetail = Event;

export type CreateEventPayload = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'status' | 'funciones'> & {
  funciones?: Omit<EventFunction, 'numero_funcion'>[];
};

export type UpdateEventPayload = Partial<CreateEventPayload> & {
  id: string;
};