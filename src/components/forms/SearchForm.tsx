import React from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';
import { Button } from '../ui/button';
import { SEARCH_CATEGORY_OPTIONS } from '../../constants/categories';

interface SearchFormData {
  busqueda: string;
  categoria: string;
  fecha: string;
}

interface SearchFormProps {
  onSearch: (filters: SearchFormData) => void;
  isLoading?: boolean;
}



export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<SearchFormData>({
    defaultValues: {
      busqueda: '',
      categoria: '',
      fecha: ''
    }
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
      fecha: ''
    });
  };

  // Búsqueda automática cuando cambian los filtros (opcional)
  React.useEffect(() => {
    const subscription = watch((data) => {
      if (data.busqueda || data.categoria || data.fecha) {
        onSearch(data as SearchFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onSearch]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Campo de búsqueda general */}
          <div className="lg:col-span-2">
            <InputField
              id="busqueda"
              label="Buscar eventos"
              placeholder="Nombre, descripción, organizador..."
              register={register}
              error={errors.busqueda}
            />
          </div>

          {/* Filtro por categoría */}
          <SelectField
            id="categoria"
            label="Categoría"
            options={SEARCH_CATEGORY_OPTIONS}
            register={register}
            error={errors.categoria}
            placeholder="Todas"
          />

          {/* Filtro por fecha */}
          <InputField
            id="fecha"
            label="Fecha"
            type="date"
            register={register}
            error={errors.fecha}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? 'Buscando...' : 'Buscar Eventos'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-none"
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Indicador de filtros activos */}
        {(watchedValues.busqueda || watchedValues.categoria || watchedValues.fecha) && (
          <div className="pt-3 border-t">
            <p className="font-subtle text-gray-600 mb-2">Filtros activos:</p>
            <div className="flex flex-wrap gap-2">
              {watchedValues.busqueda && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Búsqueda: {watchedValues.busqueda}
                </span>
              )}
              {watchedValues.categoria && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Categoría: {SEARCH_CATEGORY_OPTIONS.find(c => c.value === watchedValues.categoria)?.label}
                </span>
              )}
              {watchedValues.fecha && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Fecha: {watchedValues.fecha}
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};