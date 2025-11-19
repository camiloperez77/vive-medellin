import React from 'react';
import { Eye, Search, Users, Trophy } from 'lucide-react';
import { Event } from '@/types';

interface RankingItem {
  position: number;
  event: Event;
  views: number;
  searches: number;
  popularity: number;
}

interface EventRankingTableProps {
  ranking: RankingItem[];
}

export const EventRankingTable: React.FC<EventRankingTableProps> = ({ ranking }) => {
  console.log('📋 EventRankingTable recibió ranking:', ranking);

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-400 text-yellow-900';
    if (position === 2) return 'bg-gray-300 text-gray-900';
    if (position === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-gray-100 text-gray-700';
  };

  const getPositionIcon = (position: number) => {
    if (position <= 3) {
      return <Trophy className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Ranking de Eventos Más Populares
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Top 10 eventos basado en visualizaciones y búsquedas
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  Aforo
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  Vistas
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Search className="w-4 h-4" />
                  Búsquedas
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ranking.map(item => (
              <tr key={item.event.id} className="hover:bg-gray-50 transition-colors">
                {/* Posición */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`inline-flex items-center justify-center gap-1 w-10 h-10 rounded-full font-bold ${getPositionColor(
                      item.position
                    )}`}
                  >
                    {getPositionIcon(item.position)}
                    {item.position}
                  </div>
                </td>

                {/* Evento con Carátula */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.event.imagen_caratula || '/assets/images/eventos/default.jpg'}
                      alt={item.event.titulo}
                      className="w-16 h-16 rounded-lg object-cover shadow-sm"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/assets/images/eventos/default.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.event.titulo}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.event.fecha} • {item.event.horario}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {item.event.categoria}
                  </span>
                </td>

                {/* Aforo */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.event.aforo.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">personas</div>
                </td>

                {/* Vistas */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-blue-600">
                    {item.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">vistas</div>
                </td>

                {/* Búsquedas */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-green-600">
                    {item.searches.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">búsquedas</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con info adicional */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>1er lugar</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span>2do lugar</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span>3er lugar</span>
            </div>
          </div>
          <div className="text-gray-500">Popularidad = (Vistas × 60%) + (Búsquedas × 40%)</div>
        </div>
      </div>
    </div>
  );
};
