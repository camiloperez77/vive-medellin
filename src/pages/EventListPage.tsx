import React from 'react';
import { SearchForm } from '../components/forms/SearchForm';
import { EventList } from '../components/events/EventList';
import { eventService } from '../services/eventService';
import type { Event } from '../types';
import { compareDates } from '../utils';

interface SearchFilters {
  busqueda: string;
  categoria: string;
  fecha: string;
  estado: string;
}

export const EventListPage: React.FC = () => {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentFilters, setCurrentFilters] = React.useState<SearchFilters>({
    busqueda: '',
    categoria: '',
    fecha: '',
    estado: '',
  });
  const [hasSearched, setHasSearched] = React.useState(false);

  // No cargar eventos automáticamente al montar el componente

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setCurrentFilters(filters);
      setHasSearched(true);

      // Aplicar filtros - siempre buscar ya que no hay carga automática
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

      // Filtrar por categoría solo si se seleccionó una categoría específica (no "Todas")
      if (filters.categoria && filters.categoria !== '') {
        filteredEvents = filteredEvents.filter(event => event.categoria === filters.categoria);
      }

      if (filters.fecha) {
        filteredEvents = filteredEvents.filter(event => compareDates(event.fecha, filters.fecha));
      }

      // Filtrar por estado
      if (filters.estado && filters.estado !== '') {
        filteredEvents = filteredEvents.filter(event => event.status === filters.estado);
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
        <h1 className="font-h-1 text-slate-900 mb-4">Dashboard Administrador</h1>
      </header>
      <div className="max-w-6xl mx-auto">
        {/* Formulario de búsqueda */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* Contador de resultados */}
        {!isLoading && hasSearched && (
          <div className="mb-6">
            <p className="font-p text-gray-600">
              {events.length === 0
                ? 'No se encontraron eventos'
                : `Mostrando ${events.length} evento${events.length !== 1 ? 's' : ''}`}
              {(currentFilters.busqueda ||
                currentFilters.categoria ||
                currentFilters.fecha ||
                currentFilters.estado) &&
                ' que coinciden con tu búsqueda'}
            </p>
          </div>
        )}

        {/* Mensaje inicial cuando no se ha buscado */}
        {!isLoading && !hasSearched && (
          <div className="mb-6 text-center">
            <p className="font-p text-gray-500">
              Usa el formulario de búsqueda para encontrar eventos
            </p>
          </div>
        )}

        {/* Lista de eventos */}
        <EventList
          events={events}
          isLoading={isLoading}
          emptyMessage={
            hasSearched
              ? 'No se encontraron eventos. Intenta ajustar tus filtros de búsqueda.'
              : 'Realiza una búsqueda para ver los eventos disponibles.'
          }
        />
      </div>
    </div>
  );
};
