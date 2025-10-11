import React from 'react';
import { eventService } from '../services/eventService';
import type { Event } from '../types';
import { SearchForm } from '../components/forms/SearchForm';
import { EventList } from '../components/events/EventList';
import { EventCard } from '../components/events/EventCard';

interface SearchFilters {
  busqueda: string;
  categoria: string;
  fecha: string;
}

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchResults, setSearchResults] = React.useState<Event[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [currentFilters, setCurrentFilters] = React.useState<SearchFilters>({
    busqueda: '',
    categoria: '',
    fecha: '',
  });

  React.useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvents({
        filters: { destacado: true },
        limit: 6,
      });
      setFeaturedEvents(response.data);
    } catch (error) {
      console.error('Error al cargar eventos destacados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setCurrentFilters(filters);

      // Si no hay filtros, volver a mostrar destacados
      if (!filters.busqueda && !filters.categoria && !filters.fecha) {
        setIsSearching(false);
        loadFeaturedEvents();
        return;
      }

      // Activar modo búsqueda
      setIsSearching(true);

      // Aplicar filtros localmente
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
        filteredEvents = filteredEvents.filter(event => event.fecha === filters.fecha);
      }

      setSearchResults(filteredEvents);
    } catch (error) {
      console.error('Error al buscar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Formulario de búsqueda */}
      <div className="max-w-4xl mx-auto mb-8">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Sección condicional: Destacados o Resultados de búsqueda */}
      {!isSearching ? (
        <section className="mb-12">
          <h2 className="font-h-2 text-slate-900 mb-6 text-center">Eventos Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeletons de carga
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 border border-slate-200 animate-pulse"
                >
                  <div className="h-48 bg-slate-200 rounded-md mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                    <div className="h-8 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>
              ))
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map(evento => <EventCard key={evento.id} event={evento} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="font-p text-slate-600">
                  No hay eventos destacados disponibles en este momento.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mb-12">
          <h2 className="font-h-2 text-slate-900 mb-6 text-center">Resultados de Búsqueda</h2>

          {/* Contador de resultados */}
          {!isLoading && (
            <div className="mb-6 text-center">
              <p className="font-p text-gray-600">
                {searchResults.length === 0
                  ? 'No se encontraron eventos'
                  : `Mostrando ${searchResults.length} evento${searchResults.length !== 1 ? 's' : ''}`}
                {(currentFilters.busqueda || currentFilters.categoria || currentFilters.fecha) &&
                  ' que coinciden con tu búsqueda'}
              </p>
            </div>
          )}

          {/* Lista de resultados de búsqueda */}
          <EventList
            events={searchResults}
            isLoading={isLoading}
            emptyMessage="No se encontraron eventos. Intenta ajustar tus filtros de búsqueda."
          />
        </section>
      )}
    </div>
  );
};
