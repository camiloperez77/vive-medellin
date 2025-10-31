import React from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';
import { Button } from '../ui/button';
import { SEARCH_CATEGORY_OPTIONS } from '../../constants/categories';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_OPTIONS = [
  { value: 'published', label: 'Publicado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Finalizado' },
];

interface SearchFormData {
  busqueda: string;
  categoria: string;
  fecha: string;
  estado: string;
}

interface SearchFormProps {
  onSearch: (filters: SearchFormData) => void;
  isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>({
    defaultValues: {
      busqueda: '',
      categoria: '',
      fecha: '',
      estado: '',
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: SearchFormData) => {
    onSearch(data);
  };

  const handleReset = () => {
    reset();
    onSearch({
      busqueda: '',
      categoria: '',
      fecha: '',
      estado: '',
    });
  };

  // Búsqueda automática cuando cambian los filtros (opcional)
  React.useEffect(() => {
    const subscription = watch(data => {
      if (data.busqueda || data.categoria || data.fecha || data.estado) {
        onSearch(data as SearchFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onSearch]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div
          className={`grid grid-cols-1 ${user?.role === 'admin' ? 'md:grid-cols-2 lg:grid-cols-10' : 'md:grid-cols-4'} gap-4`}
        >
          {/* Campo de búsqueda general */}
          <div
            className={`${user?.role === 'admin' ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-2'}`}
          >
            <InputField
              id="busqueda"
              label="Buscar eventos"
              placeholder="Nombre, descripción, organizador..."
              register={register}
              error={errors.busqueda}
            />
          </div>

          {/* Filtro por categoría */}
          <div
            className={`${user?.role === 'admin' ? 'md:col-span-1 lg:col-span-2' : 'md:col-span-1'}`}
          >
            <SelectField
              id="categoria"
              label="Categoría"
              options={SEARCH_CATEGORY_OPTIONS}
              register={register}
              error={errors.categoria}
              placeholder="Categorías"
            />
          </div>

          {/* Filtro por fecha */}
          <div
            className={`${user?.role === 'admin' ? 'md:col-span-1 lg:col-span-2' : 'md:col-span-1'}`}
          >
            <InputField
              id="fecha"
              label="Fecha"
              type="date"
              register={register}
              error={errors.fecha}
            />
          </div>

          {/* Filtro por estado (solo para administradores) */}
          {user?.role === 'admin' && (
            <div className="md:col-span-1 lg:col-span-2">
              <SelectField
                id="estado"
                label="Estado"
                options={STATUS_OPTIONS}
                register={register}
                error={errors.estado}
                placeholder="Estados"
              />
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Buscando...
              </div>
            ) : (
              'Buscar Eventos'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-none px-6 py-2.5 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Indicador de filtros activos */}
        {(watchedValues.busqueda ||
          watchedValues.categoria ||
          watchedValues.fecha ||
          watchedValues.estado) && (
          <div className="pt-4 border-t border-gray-100">
            <p className="font-medium text-gray-700 mb-3 text-sm">Filtros activos:</p>
            <div className="flex flex-wrap gap-2">
              {watchedValues.busqueda && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="mr-1">🔍</span>
                  {watchedValues.busqueda}
                </span>
              )}
              {watchedValues.categoria && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <span className="mr-1">📂</span>
                  {watchedValues.categoria === ''
                    ? 'Todas las categorías'
                    : SEARCH_CATEGORY_OPTIONS.find(c => c.value === watchedValues.categoria)?.label}
                </span>
              )}
              {watchedValues.fecha && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <span className="mr-1">📅</span>
                  {watchedValues.fecha}
                </span>
              )}
              {watchedValues.estado && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <span className="mr-1">⚡</span>
                  {watchedValues.estado === ''
                    ? 'Todos los estados'
                    : STATUS_OPTIONS.find(s => s.value === watchedValues.estado)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
