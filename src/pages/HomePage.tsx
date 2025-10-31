import React from 'react';
import { eventService } from '../services/eventService';
import type { Event } from '../types';
import { SearchForm } from '../components/forms/SearchForm';
import { EventList } from '../components/events/EventList';
import { EventCard } from '../components/events/EventCard';
import { isEventActive, isEventFinished } from '../utils';
import { compareDates } from '../utils';
import { useAuth } from '../contexts/AuthContext';

interface SearchFilters {
  busqueda: string;
  categoria: string;
  fecha: string;
  estado?: string;
}

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchResults, setSearchResults] = React.useState<Event[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [currentFilters, setCurrentFilters] = React.useState<SearchFilters>({
    busqueda: '',
    categoria: '',
    fecha: '',
    estado: '',
  });

  React.useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvents();

      // Filtrar eventos según el rol del usuario
      let filteredEvents = response.data;

      // Si no es administrador, solo mostrar eventos publicados y cancelados
      if (user?.role !== 'admin') {
        filteredEvents = filteredEvents.filter(
          event => event.status === 'published' || event.status === 'cancelled'
        );
      }

      // Filtrar eventos vigentes (publicados no finalizados) y cancelados no finalizados
      const visibleEvents = filteredEvents.filter(event => {
        // Eventos publicados activos
        if (event.status === 'published' && isEventActive(event)) {
          return true;
        }
        // Eventos cancelados que no han finalizado
        if (event.status === 'cancelled' && !isEventFinished(event.fecha, event.horario)) {
          return true;
        }
        return false;
      });

      // Separar eventos destacados y no destacados
      const featuredEvents = visibleEvents.filter(event => event.destacado);
      const nonFeaturedEvents = visibleEvents.filter(event => !event.destacado);

      // Combinar: primero destacados, luego no destacados (limitado a 12 total)
      const combinedEvents = [...featuredEvents, ...nonFeaturedEvents].slice(0, 12);

      setFeaturedEvents(combinedEvents);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setCurrentFilters(filters);

      // Si no hay filtros, volver a mostrar destacados
      if (!filters.busqueda && !filters.categoria && !filters.fecha && !filters.estado) {
        setIsSearching(false);
        loadFeaturedEvents();
        return;
      }

      // Activar modo búsqueda
      setIsSearching(true);

      // Aplicar filtros localmente
      const response = await eventService.getEvents();
      let filteredEvents = response.data;

      // Filtrar por estado según el rol del usuario
      if (user?.role !== 'admin') {
        filteredEvents = filteredEvents.filter(
          event => event.status === 'published' || event.status === 'cancelled'
        );
      }

      // Aplicar filtros de búsqueda
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

      // Filtrar por estado (solo para administradores)
      if (user?.role === 'admin' && filters.estado && filters.estado !== '') {
        filteredEvents = filteredEvents.filter(event => event.status === filters.estado);
      }

      // Para usuarios no admin, aplicar filtro adicional de eventos visibles
      if (user?.role !== 'admin') {
        filteredEvents = filteredEvents.filter(event => {
          // Eventos publicados activos
          if (event.status === 'published' && isEventActive(event)) {
            return true;
          }
          // Eventos cancelados que no han finalizado
          if (event.status === 'cancelled' && !isEventFinished(event.fecha, event.horario)) {
            return true;
          }
          return false;
        });
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
          <h2 className="font-h-2 text-slate-900 mb-6 text-center">Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeletons de carga
              Array.from({ length: 12 }).map((_, index) => (
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
                  No hay eventos vigentes disponibles en este momento.
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
                {(currentFilters.busqueda ||
                  currentFilters.categoria ||
                  currentFilters.fecha ||
                  currentFilters.estado) &&
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
