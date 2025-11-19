import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Users, Calendar, Award } from 'lucide-react';
import { eventService } from '../services/eventService';
import { CategoriesPieChart } from '../components/charts/PieChart';
import { EventRankingTable } from '../components/charts/EventRankingTable';
import { Event } from '../types';

export const TrendsPage: React.FC = () => {
  const [trendsData, setTrendsData] = useState<{
    totalEvents: number;
    activeEvents: number;
    totalUsers: number;
    popularCategories: Array<{ name: string; count: number; percentage: number }>;
    topLocations: Array<{ name: string; count: number; percentage: number }>;
    monthlyGrowth: Array<{ month: string; events: number }>;
  }>({
    totalEvents: 0,
    activeEvents: 0,
    totalUsers: 0,
    popularCategories: [],
    topLocations: [],
    monthlyGrowth: [],
  });

  const [eventRanking, setEventRanking] = useState<
    Array<{
      position: number;
      event: Event;
      views: number;
      searches: number;
      popularity: number;
    }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        const [data, ranking] = await Promise.all([
          eventService.getTrendsData(),
          eventService.getEventRanking(),
        ]);
        console.log('📊 Datos de tendencias cargados:', data);
        console.log('🏆 Ranking de eventos cargado:', ranking);
        setTrendsData(data);
        setEventRanking(ranking);
      } catch (err) {
        console.error('Error fetching trends data:', err);
        setError('Error al cargar los datos de tendencias');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tendencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Tendencias
          </h1>
          <p className="text-gray-600 mt-2">Estadísticas de la plataforma Vive Medellín</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{trendsData.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{trendsData.activeEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trendsData.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trendsData.popularCategories.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Ranking Table */}
        <div className="mb-8">
          <EventRankingTable ranking={eventRanking} />
        </div>

        {/* Popular Categories Pie Chart */}
        <div className="mb-8">
          <CategoriesPieChart categories={trendsData.popularCategories} />
        </div>

        {/* Monthly Growth Chart */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🚀 Próximas Funcionalidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
