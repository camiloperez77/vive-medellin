import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { EventDetails } from '../components/events/EventDetails';
import { eventService } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../types';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = React.useState<Event | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Determinar si mostrar acciones de admin
  // Solo mostrar si el usuario es admin (independientemente de desde dónde venga)
  const showAdminActions = user?.role === 'admin';

  React.useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const event = await eventService.getEventById(eventId);
      setEvent(event);
    } catch (error) {
      console.error('Error al cargar evento:', error);
      setError('No se pudo cargar el evento. Puede que no exista o haya ocurrido un error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      await eventService.cancelEvent(eventId, 'admin1'); // En el futuro esto vendría del contexto de usuario

      // Actualizar el estado local del evento
      setEvent(prevEvent =>
        prevEvent
          ? {
              ...prevEvent,
              status: 'cancelled' as any,
              cancelled_at: new Date().toISOString(),
              cancelled_by: 'admin1',
              updated_at: new Date().toISOString(),
            }
          : null
      );

      alert('✅ Evento cancelado exitosamente.');
    } catch (error) {
      console.error('Error al cancelar evento:', error);
      throw error; // Re-lanzar el error para que lo maneje el componente
    }
  };

  const handleToggleFeatured = async (eventId: string) => {
    try {
      await eventService.toggleFeatured(eventId);

      // Actualizar el estado local del evento
      setEvent(prevEvent =>
        prevEvent
          ? {
              ...prevEvent,
              destacado: !prevEvent.destacado,
              updated_at: new Date().toISOString(),
            }
          : null
      );

      alert(`✅ Evento ${!event?.destacado ? 'destacado' : 'quitado del destaque'} exitosamente.`);
    } catch (error) {
      console.error('Error al cambiar estado destacado:', error);
      throw error; // Re-lanzar el error para que lo maneje el componente
    }
  };

  // Si no hay ID, redirigir a la lista de eventos
  if (!id) {
    return <Navigate to="/eventos" replace />;
  }

  // Si hay error, mostrar mensaje de error
  if (error && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-h-1 text-slate-900 mb-4">Evento no encontrado</h1>
          <p className="font-p text-gray-600 mb-8">{error}</p>
          <a
            href="/eventos"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Ver Todos los Eventos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {event ? (
        <EventDetails
          event={event}
          isLoading={isLoading}
          onCancelEvent={handleCancelEvent}
          onToggleFeatured={handleToggleFeatured}
          showAdminActions={showAdminActions}
        />
      ) : (
        <EventDetails
          event={{} as Event}
          isLoading={isLoading}
          showAdminActions={showAdminActions}
        />
      )}
    </div>
  );
};
