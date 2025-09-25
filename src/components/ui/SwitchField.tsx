import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface SwitchFieldProps {
  id: string;
  label: string;
  description?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  className?: string;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  id,
  label,
  description,
  register,
  error,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <input
            id={id}
            type="checkbox"
            {...register(id)}
            className="
              h-4 w-4 text-blue-600 border-gray-300 rounded
              focus:ring-blue-500 focus:ring-2
            "
          />
        </div>
        <div className="flex-1">
          <label htmlFor={id} className="block font-subtitle text-slate-900 cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="font-subtle text-gray-600 text-sm mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-red-500 font-subtle text-sm ml-7">
          {error.message}
        </p>
      )}
    </div>
  );
};