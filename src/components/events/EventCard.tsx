import React from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { isEventFinished } from '../../utils';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateStr: string) => {
    try {
      // Parse dd/mm/yyyy format
      const [day, month, year] = dateStr.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return new Intl.DateTimeFormat('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (value: number | 'gratuito') => {
    if (value === 'gratuito') return 'Gratis';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(value);
    }
    return 'Precio por confirmar';
  };

  const getCategoryLabel = (category: string) => {
    // Las nuevas categorías ya tienen nombres descriptivos completos
    return category || 'Sin categoría';
  };

  // Determinar si el evento ya finalizó
  const eventFinished = isEventFinished(event.fecha, event.horario);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
      {/* Imagen del evento */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        {event.imagen_caratula ? (
          <img
            src={event.imagen_caratula}
            alt={event.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🎭</div>
              <p className="font-medium">{getCategoryLabel(event.categoria)}</p>
            </div>
          </div>
        )}

        {/* Badge de categoría */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800">
            {getCategoryLabel(event.categoria)}
          </span>
        </div>

        {/* Badge de evento finalizado */}
        {eventFinished && (
          <div className="absolute top-4 right-4">
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              📅 Finalizado
            </span>
          </div>
        )}

        {/* Badge de evento destacado (solo si no está finalizado) */}
        {event.destacado && !eventFinished && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ Destacado
            </span>
          </div>
        )}

        {/* Overlay de evento cancelado */}
        {event.status === 'cancelled' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div
              className="bg-red-600 text-white px-8 py-3 font-bold text-xl transform -rotate-12 shadow-lg"
              style={{
                fontFamily: 'Arial Black, sans-serif',
                letterSpacing: '2px',
              }}
            >
              CANCELADO
            </div>
          </div>
        )}

        {/* Overlay sutil para evento finalizado */}
        {eventFinished && event.status !== 'cancelled' && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        )}
      </div>

      {/* Contenido del evento */}
      <div className="p-6">
        {/* Fecha y hora */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDate(event.fecha)} • {event.horario}
        </div>

        {/* Título */}
        <h3 className="font-h-3 text-slate-900 mb-3 line-clamp-2">{event.titulo}</h3>

        {/* Descripción */}
        <p className="font-p text-gray-600 mb-4 line-clamp-3">{event.descripcion}</p>

        {/* Ubicación */}
        <div className="flex items-start text-sm text-gray-600 mb-3">
          <svg
            className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-2">
            {event.ubicacion.direccion_detallada ||
              event.ubicacion.direccion_completa ||
              'Ubicación por confirmar'}
          </span>
        </div>

        {/* Organizador y precio */}
        <div className="flex justify-between items-end">
          <div>
            <p className="font-subtle text-gray-500 text-xs mb-1">Organizado por</p>
            <p className="font-medium text-gray-900 text-sm">{event.organizador.nombre}</p>
          </div>

          <div className="text-right">
            <p className="font-bold text-lg text-blue-600">{formatPrice(event.valor_ingreso)}</p>
            {event.aforo && (
              <p className="font-subtle text-gray-500 text-xs">Aforo: {event.aforo} personas</p>
            )}
          </div>
        </div>

        {/* Botón para ver más */}
        {event.status === 'cancelled' ? (
          <div className="block w-full mt-4 bg-gray-400 text-white text-center font-medium py-2 px-4 rounded-md cursor-not-allowed">
            Evento Cancelado
          </div>
        ) : (
          <Link
            to={`/eventos/${event.id}`}
            className="block w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Ver Detalles
          </Link>
        )}
      </div>
    </div>
  );
};
