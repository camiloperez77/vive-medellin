import { Event, EventSearchParams, ApiResponse, PaginatedResponse } from '@/types';

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
        id: this.generateId(),
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
   * Genera un ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const eventService = new EventService();
