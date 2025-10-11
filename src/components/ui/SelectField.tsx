import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface SelectFieldProps {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  options,
  register,
  error,
  required = false,
  placeholder = 'Seleccionar...',
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block font-subtitle text-slate-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        {...register(id)}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm 
          font-p text-slate-900 bg-white h-10
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 font-subtle text-sm">{error.message}</p>}
    </div>
  );
};
