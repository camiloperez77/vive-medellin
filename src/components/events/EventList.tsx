import React from 'react';
import { EventCard } from './EventCard';
import type { Event } from '../../types';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  isLoading = false, 
  emptyMessage = 'No se encontraron eventos.' 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Skeleton loading cards */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
              <div className="flex justify-between items-end">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎭</div>
        <h3 className="font-h-3 text-slate-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="font-p text-gray-600 max-w-md mx-auto">
          Intenta ajustar tus filtros de búsqueda o explora otras categorías de eventos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};