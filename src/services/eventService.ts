import { Event, EventSearchParams, ApiResponse, PaginatedResponse } from '@/types';
import { generateId } from '@/utils';

const API_BASE_URL = 'http://localhost:3001';

class EventService {
  /**
   * Obtiene todos los eventos con filtros opcionales
   */
  async getEvents(params?: EventSearchParams): Promise<PaginatedResponse<Event>> {
    try {
      const searchParams = new URLSearchParams();

      if (params?.query) {
        searchParams.append('q', params.query);
      }

      if (params?.filters?.categoria) {
        searchParams.append('categoria', params.filters.categoria);
      }

      if (params?.filters?.destacado !== undefined) {
        searchParams.append('destacado', params.filters.destacado.toString());
      }

      if (params?.page) {
        searchParams.append('_page', params.page.toString());
      }

      if (params?.limit) {
        searchParams.append('_limit', params.limit.toString());
      }

      const response = await fetch(`${API_BASE_URL}/eventos?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const eventos = await response.json();
      const total = parseInt(response.headers.get('X-Total-Count') || '0');

      return {
        data: eventos,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total,
          totalPages: Math.ceil(total / (params?.limit || 10)),
        },
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Obtiene eventos destacados
   */
  async getFeaturedEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos?destacado=true`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  }

  /**
   * Obtiene un evento por ID
   */
  async getEventById(id: string): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Evento no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo evento
   */
  async createEvent(eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const newEvent = {
        ...eventData,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'published',
        funciones: [
          {
            numero_funcion: 1,
            fecha: eventData.fecha,
            horario: eventData.horario,
            status: 'published',
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const createdEvent = await response.json();

      return {
        data: createdEvent,
        message: 'Evento creado exitosamente',
        success: true,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Actualiza un evento existente con registro de auditoría
   */
  async updateEvent(
    id: string,
    eventData: Partial<Event>,
    editedBy: string = 'admin1'
  ): Promise<ApiResponse<Event>> {
    try {
      // Obtener el evento actual para comparar cambios
      const currentEvent = await this.getEventById(id);

      // Detectar campos editados
      const changedFields = this.detectChanges(currentEvent, eventData);

      const updatedEvent = {
        ...eventData,
        updated_at: new Date().toISOString(),
        // Registro de auditoría
        last_edited_by: editedBy,
        last_edited_at: new Date().toISOString(),
        edit_history: [
          ...(currentEvent.edit_history || []),
          {
            edited_by: editedBy,
            edited_at: new Date().toISOString(),
            changed_fields: changedFields,
            changes: this.getFieldChanges(currentEvent, eventData, changedFields),
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updated = await response.json();

      return {
        data: updated,
        message: 'Evento actualizado exitosamente',
        success: true,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Detecta qué campos han cambiado
   */
  private detectChanges(current: Event, updated: Partial<Event>): string[] {
    const changes: string[] = [];

    if (updated.titulo !== undefined && updated.titulo !== current.titulo) changes.push('título');
    if (updated.descripcion !== undefined && updated.descripcion !== current.descripcion)
      changes.push('descripción');
    if (updated.fecha !== undefined && updated.fecha !== current.fecha) changes.push('fecha');
    if (updated.horario !== undefined && updated.horario !== current.horario)
      changes.push('horario');
    if (updated.categoria !== undefined && updated.categoria !== current.categoria)
      changes.push('categoría');
    if (updated.modalidad !== undefined && updated.modalidad !== current.modalidad)
      changes.push('modalidad');
    if (updated.aforo !== undefined && updated.aforo !== current.aforo) changes.push('aforo');
    if (updated.valor_ingreso !== undefined && updated.valor_ingreso !== current.valor_ingreso)
      changes.push('valor de ingreso');
    if (updated.destacado !== undefined && updated.destacado !== current.destacado)
      changes.push('destacado');

    // Verificar cambios en ubicación
    if (updated.ubicacion) {
      if (updated.ubicacion.comuna_barrio !== current.ubicacion.comuna_barrio)
        changes.push('comuna/barrio');
      if (updated.ubicacion.direccion_detallada !== current.ubicacion.direccion_detallada)
        changes.push('dirección');
      if (updated.ubicacion.enlace_mapa !== current.ubicacion.enlace_mapa)
        changes.push('enlace del mapa');
    }

    // Verificar cambios en organizador
    if (updated.organizador) {
      if (updated.organizador.nombre !== current.organizador.nombre)
        changes.push('nombre del organizador');
      if (updated.organizador.email !== current.organizador.email)
        changes.push('email del organizador');
      if (updated.organizador.celular !== current.organizador.celular)
        changes.push('celular del organizador');
    }

    return changes;
  }

  /**
   * Obtiene los detalles específicos de los cambios
   */
  private getFieldChanges(
    current: Event,
    updated: Partial<Event>,
    changedFields: string[]
  ): Record<string, { before: any; after: any }> {
    const changes: Record<string, { before: any; after: any }> = {};

    changedFields.forEach(field => {
      switch (field) {
        case 'título':
          changes.titulo = { before: current.titulo, after: updated.titulo };
          break;
        case 'descripción':
          changes.descripcion = { before: current.descripcion, after: updated.descripcion };
          break;
        case 'fecha':
          changes.fecha = { before: current.fecha, after: updated.fecha };
          break;
        case 'horario':
          changes.horario = { before: current.horario, after: updated.horario };
          break;
        // Agregar más casos según sea necesario
      }
    });

    return changes;
  }

  /**
   * Cancela un evento
   */
  async cancelEvent(id: string, cancelledBy: string): Promise<ApiResponse<Event>> {
    try {
      const cancelData = {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const cancelledEvent = await response.json();

      return {
        data: cancelledEvent,
        message: 'Evento cancelado exitosamente',
        success: true,
      };
    } catch (error) {
      console.error('Error cancelling event:', error);
      throw error;
    }
  }

  /**
   * Cambia el estado destacado de un evento
   */
  async toggleFeatured(id: string): Promise<ApiResponse<Event>> {
    try {
      // Obtener el evento actual para saber el estado actual
      const currentEvent = await this.getEventById(id);

      const toggleData = {
        destacado: !currentEvent.destacado,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toggleData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedEvent = await response.json();

      return {
        data: updatedEvent,
        message: `Evento ${!currentEvent.destacado ? 'destacado' : 'quitado del destaque'} exitosamente`,
        success: true,
      };
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  }

  /**
   * Obtiene eventos por categoría
   */
  async getEventsByCategory(categoria: string): Promise<Event[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/eventos?categoria=${encodeURIComponent(categoria)}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching events by category:', error);
      throw error;
    }
  }

  /**
   * Busca eventos por texto
   */
  async searchEvents(query: string): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  /**
   * Verifica si hay espacio para más eventos destacados
   */
  async canHighlightEvent(): Promise<boolean> {
    try {
      const featuredEvents = await this.getFeaturedEvents();
      return featuredEvents.length < 3;
    } catch (error) {
      console.error('Error checking highlight availability:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas y tendencias de la plataforma
   */
  async getTrendsData(): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalUsers: number;
    popularCategories: Array<{ name: string; count: number; percentage: number }>;
    topLocations: Array<{ name: string; count: number; percentage: number }>;
    monthlyGrowth: Array<{ month: string; events: number }>;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const events: Event[] = await response.json();

      // Calcular estadísticas
      const totalEvents = events.length;
      const activeEvents = events.filter(event => event.status === 'published').length;

      // Para usuarios, mantenemos un valor mock ya que no está en db.json
      const totalUsers = 2847;

      // Calcular categorías populares
      const categoryCount: Record<string, number> = {};
      events.forEach(event => {
        categoryCount[event.categoria] = (categoryCount[event.categoria] || 0) + 1;
      });

      const popularCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalEvents) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calcular ubicaciones más activas
      const locationCount: Record<string, number> = {};
      events.forEach(event => {
        const location = event.ubicacion.comuna_barrio;
        locationCount[location] = (locationCount[location] || 0) + 1;
      });

      const topLocations = Object.entries(locationCount)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalEvents) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calcular crecimiento mensual
      const monthlyCount: Record<string, number> = {};
      events.forEach(event => {
        try {
          // Parsear fecha en formato DD/MM/YYYY
          const [day, month, year] = event.fecha.split('/');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

          monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
        } catch (error) {
          console.warn('Error parsing date for event:', event.id, event.fecha);
        }
      });

      // Crear array de meses ordenado
      const monthNames = [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ];
      const monthlyGrowth = monthNames.map(month => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        events: monthlyCount[month] || 0,
      }));

      return {
        totalEvents,
        activeEvents,
        totalUsers,
        popularCategories,
        topLocations,
        monthlyGrowth,
      };
    } catch (error) {
      console.error('Error fetching trends data:', error);
      throw error;
    }
  }

  /**
   * Obtiene el ranking de eventos más populares basado en visualizaciones y búsquedas
   */
  async getEventRanking(): Promise<
    Array<{
      position: number;
      event: Event;
      views: number;
      searches: number;
      popularity: number;
    }>
  > {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const events: Event[] = await response.json();

      // Filtrar solo eventos publicados
      const publishedEvents = events.filter(event => event.status === 'published');

      // Generar datos mockeados de visualizaciones y búsquedas
      const eventsWithStats = publishedEvents.map(event => {
        // Generar números aleatorios pero determinísticos basados en el ID
        const seed = parseInt(event.id) || Math.random();
        const views = Math.floor(150 + seed * 850); // Entre 150 y 1000
        const searches = Math.floor(50 + seed * 450); // Entre 50 y 500

        // Calcular popularidad (60% peso a vistas, 40% a búsquedas)
        const popularity = views * 0.6 + searches * 0.4;

        return {
          event,
          views,
          searches,
          popularity,
        };
      });

      // Ordenar por popularidad descendente y tomar top 10
      const ranking = eventsWithStats
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10)
        .map((item, index) => ({
          position: index + 1,
          ...item,
        }));

      return ranking;
    } catch (error) {
      console.error('Error fetching event ranking:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
