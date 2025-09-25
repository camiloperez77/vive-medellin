import React from 'react';
import { eventService } from '../services/eventService';
import type { Event } from '../types';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvents({ 
        filters: { destacado: true },
        limit: 6 
      });
      setFeaturedEvents(response.data);
    } catch (error) {
      console.error('Error al cargar eventos destacados:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="font-h-1 text-slate-900 mb-4">
          Bienvenido a Vive Medellín
        </h1>
        <p className="font-p text-slate-700 max-w-3xl mx-auto">
          Descubre, explora y participa en la amplia variedad de eventos que Medellín tiene para ti.
          Desde conciertos hasta conferencias tecnológicas, encuentra la actividad perfecta para cada momento.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-h-2 text-slate-900 mb-6 text-center">
          Eventos Destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeletons de carga
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-slate-200 animate-pulse">
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
            featuredEvents.map((evento) => (
              <div key={evento.id} className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow relative">
                <div className="h-48 bg-slate-100 rounded-md mb-4 overflow-hidden relative">
                  {evento.imagen_caratula ? (
                    <img 
                      src={evento.imagen_caratula} 
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-event.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <span className="text-slate-500 text-sm">Sin imagen</span>
                    </div>
                  )}
                  
                  {/* Overlay de evento cancelado */}
                  {evento.status === 'cancelled' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div 
                        className="bg-red-600 text-white px-8 py-3 font-bold text-xl transform -rotate-12 shadow-lg"
                        style={{ 
                          fontFamily: 'Arial Black, sans-serif',
                          letterSpacing: '2px'
                        }}
                      >
                        CANCELADO
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="font-h-4 text-slate-900 mb-2 line-clamp-2">{evento.titulo}</h3>
                <p className="font-subtle text-slate-600 mb-4 line-clamp-3">{evento.descripcion}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    <div>{evento.fecha}</div>
                    <div>{evento.horario}</div>
                  </div>
                  {evento.status === 'cancelled' ? (
                    <div className="bg-gray-400 text-white px-4 py-2 rounded-md font-small cursor-not-allowed">
                      Evento Cancelado
                    </div>
                  ) : (
                    <Link 
                      to={`/eventos/${evento.id}`}
                      className="bg-purple-700 text-white px-4 py-2 rounded-md font-small hover:bg-purple-800 transition-colors"
                    >
                      Ver detalles
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="font-p text-slate-600">No hay eventos destacados disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};