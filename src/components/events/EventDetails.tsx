import React from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { isEventFinished } from '../../utils';

interface EventDetailsProps {
  event: Event;
  isLoading?: boolean;
  onCancelEvent?: (eventId: string) => Promise<void>;
  onToggleFeatured?: (eventId: string) => Promise<void>;
  showAdminActions?: boolean;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  isLoading = false,
  onCancelEvent,
  onToggleFeatured,
  showAdminActions = false,
}) => {
  const [showAdminMenu, setShowAdminMenu] = React.useState(false);

  // Determinar si el evento ya finalizó
  const eventFinished = isEventFinished(event.fecha, event.horario);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      // Parse dd/mm/yyyy format
      const [day, month, year] = dateStr.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return new Intl.DateTimeFormat('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (value: number | 'gratuito') => {
    if (value === 'gratuito') return 'Evento Gratuito';
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
    const categoryMap: Record<string, string> = {
      musica: 'Música',
      teatro: 'Teatro',
      danza: 'Danza',
      arte: 'Arte y Exposiciones',
      cine: 'Cine',
      literatura: 'Literatura',
      gastronomia: 'Gastronomía',
      deportes: 'Deportes y Recreación',
      familia: 'Actividades Familiares',
      educativo: 'Educativo',
      otro: 'Otro',
    };
    return categoryMap[category] || category;
  };

  const handleCancelEvent = async () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres cancelar el evento "${event.titulo}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      if (onCancelEvent) {
        try {
          await onCancelEvent(event.id);
        } catch (error) {
          console.error('Error al cancelar evento:', error);
          alert('❌ Error al cancelar el evento. Por favor intenta nuevamente.');
        }
      }
    }
  };

  const handleToggleFeatured = async () => {
    if (
      window.confirm(
        event.destacado
          ? `¿Quieres quitar el destaque del evento "${event.titulo}"?`
          : `¿Quieres destacar el evento "${event.titulo}"?`
      )
    ) {
      if (onToggleFeatured) {
        try {
          await onToggleFeatured(event.id);
        } catch (error) {
          console.error('Error al cambiar estado destacado:', error);
          alert('❌ Error al cambiar el estado del evento. Por favor intenta nuevamente.');
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Imagen principal */}
      <div className="h-64 md:h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-8 relative overflow-hidden">
        {event.imagen_caratula ? (
          <img
            src={event.imagen_caratula}
            alt={event.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-xl font-medium">{getCategoryLabel(event.categoria)}</p>
            </div>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Indicador de evento cancelado */}
        {event.status === 'cancelled' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-red-600 text-white px-8 py-4 rounded-lg transform -rotate-12 shadow-lg">
              <span className="text-2xl font-bold">❌ CANCELADO</span>
            </div>
          </div>
        )}

        {/* Indicador de evento finalizado */}
        {eventFinished && event.status !== 'cancelled' && (
          <div className="absolute top-6 left-6">
            <span className="bg-gray-600 text-white px-4 py-2 rounded-full font-bold">
              📅 Finalizado
            </span>
          </div>
        )}

        {event.destacado && event.status !== 'cancelled' && !eventFinished && (
          <div className="absolute top-6 right-6">
            <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold">
              ⭐ Evento Destacado
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {getCategoryLabel(event.categoria)}
              </span>
            </div>

            <h1 className="font-h-1 text-slate-900 mb-4">{event.titulo}</h1>
          </div>

          {/* Descripción */}
          <div className="mb-8">
            <h2 className="font-h-2 text-slate-900 mb-4">Sobre el Evento</h2>
            <div className="font-p text-gray-700 prose prose-lg">
              {event.descripcion.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Servicios adicionales */}
          {event.servicios_adicionales && event.servicios_adicionales.length > 0 && (
            <div className="mb-8">
              <h2 className="font-h-2 text-slate-900 mb-4">Servicios Incluidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.servicios_adicionales.map((servicio, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-green-600">✓</div>
                    <div>
                      <p className="font-medium text-gray-900">{servicio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar con información del evento */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            {/* Precio */}
            <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-h-2 text-blue-600">{formatPrice(event.valor_ingreso)}</p>
            </div>

            {/* Información del evento */}
            <div className="space-y-4 mb-6">
              {/* Fecha y hora */}
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-gray-400 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Fecha y Hora</p>
                  <p className="text-gray-600">{formatDate(event.fecha)}</p>
                  <p className="text-gray-600">{event.horario}</p>
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-gray-400 mt-1"
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
                <div>
                  <p className="font-medium text-gray-900">Ubicación</p>
                  <p className="text-gray-600">
                    {event.ubicacion.direccion_detallada && (
                      <span className="block">{event.ubicacion.direccion_detallada}</span>
                    )}
                    <span>{event.ubicacion.direccion_completa}</span>
                  </p>
                  {event.ubicacion.enlace_mapa && (
                    <a
                      href={event.ubicacion.enlace_mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver en el mapa →
                    </a>
                  )}
                </div>
              </div>

              {/* Aforo */}
              {event.aforo && (
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-gray-400 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Capacidad</p>
                    <p className="text-gray-600">{event.aforo} personas</p>
                  </div>
                </div>
              )}

              {/* Organizador */}
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-gray-400 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Organizador</p>
                  <p className="text-gray-600">{event.organizador.nombre}</p>
                  {event.organizador.email && (
                    <a
                      href={`mailto:${event.organizador.email}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {event.organizador.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones de administrador */}
            {event.status !== 'cancelled' && !eventFinished && showAdminActions && (
              <div className="relative">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>⚙️ Acciones de Administrador</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showAdminMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showAdminMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      <Link
                        to={`/editar-evento/${event.id}`}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        <span className="text-green-600">📝</span>
                        <span>Editar Evento</span>
                      </Link>

                      <button
                        onClick={() => {
                          handleToggleFeatured();
                          setShowAdminMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <span className={event.destacado ? 'text-yellow-600' : 'text-gray-400'}>
                          {event.destacado ? '⭐' : '☆'}
                        </span>
                        <span>{event.destacado ? 'Quitar Destacado' : 'Destacar Evento'}</span>
                      </button>

                      <button
                        onClick={() => {
                          handleCancelEvent();
                          setShowAdminMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <span>❌</span>
                        <span>Cancelar Evento</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estado del evento */}
            {event.status === 'cancelled' && (
              <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 px-4 rounded-lg text-center">
                📅 Evento Cancelado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
