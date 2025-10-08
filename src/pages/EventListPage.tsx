import React from 'react';
import { SearchForm } from '../components/forms/SearchForm';
import { EventList } from '../components/events/EventList';
import { eventService } from '../services/eventService';
import type { Event } from '../types';

interface SearchFilters {
  busqueda: string;
  categoria: string;
  fecha: string;
}

export const EventListPage: React.FC = () => {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentFilters, setCurrentFilters] = React.useState<SearchFilters>({
    busqueda: '',
    categoria: '',
    fecha: '',
  });

  // Cargar eventos inicialmente
  React.useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const events = await eventService.getFeaturedEvents();
      setEvents(events);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setCurrentFilters(filters);

      // Si no hay filtros, cargar todos los eventos
      if (!filters.busqueda && !filters.categoria && !filters.fecha) {
        const response = await eventService.getEvents();
        setEvents(response.data);
        return;
      }

      // Aplicar filtros localmente (en una implementación real, esto se haría en el backend)
      const response = await eventService.getEvents();
      let filteredEvents = response.data;

      if (filters.busqueda) {
        filteredEvents = filteredEvents.filter(
          event =>
            event.titulo.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
            event.descripcion.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
            event.organizador.nombre.toLowerCase().includes(filters.busqueda.toLowerCase())
        );
      }

      if (filters.categoria) {
        filteredEvents = filteredEvents.filter(event => event.categoria === filters.categoria);
      }

      if (filters.fecha) {
        filteredEvents = filteredEvents.filter(event => event.fecha === filters.fecha);
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error al buscar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="font-h-1 text-slate-900 mb-4">Eventos Destacados en Medellín</h1>
        <p className="font-p text-slate-700 max-w-3xl mx-auto">
          Descubre los eventos más destacados y populares que suceden en nuestra ciudad. Desde
          conciertos hasta conferencias tecnológicas, encuentra las experiencias más recomendadas.
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Formulario de búsqueda */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* Contador de resultados */}
        {!isLoading && (
          <div className="mb-6">
            <p className="font-p text-gray-600">
              {events.length === 0
                ? 'No se encontraron eventos destacados'
                : `Mostrando ${events.length} evento${events.length !== 1 ? 's' : ''} destacado${events.length !== 1 ? 's' : ''}`}
              {(currentFilters.busqueda || currentFilters.categoria || currentFilters.fecha) &&
                ' que coinciden con tu búsqueda'}
            </p>
          </div>
        )}

        {/* Lista de eventos */}
        <EventList
          events={events}
          isLoading={isLoading}
          emptyMessage="No se encontraron eventos. Intenta ajustar tus filtros de búsqueda."
        />
      </div>
    </div>
  );
};
