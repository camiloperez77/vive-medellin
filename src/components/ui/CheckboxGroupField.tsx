import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupFieldProps {
  id: string;
  label: string;
  options: CheckboxOption[];
  register: UseFormRegister<any>;
  error?: FieldError;
  description?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  id,
  label,
  options,
  register,
  error,
  description,
  className = '',
  columns = 2
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="block font-subtitle text-slate-900 mb-2">
          {label}
        </label>
        {description && (
          <p className="font-subtle text-gray-600 text-sm mb-3">
            {description}
          </p>
        )}
      </div>

      <div className={`grid gap-3 ${gridCols[columns]}`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              id={`${id}-${option.value}`}
              type="checkbox"
              value={option.value}
              {...register(id)}
              className="
                h-4 w-4 text-blue-600 border-gray-300 rounded
                focus:ring-blue-500 focus:ring-2
              "
            />
            <label
              htmlFor={`${id}-${option.value}`}
              className="font-p text-gray-700 text-sm cursor-pointer flex-1"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-500 font-subtle text-sm">
          {error.message}
        </p>
      )}
    </div>
  );
};