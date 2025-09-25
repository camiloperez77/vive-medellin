import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface TextareaFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  placeholder,
  register,
  error,
  required = false,
  rows = 4,
  maxLength,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block font-subtitle text-slate-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {maxLength && (
          <span className="font-subtle text-gray-500 ml-2">
            (máx. {maxLength} caracteres)
          </span>
        )}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        {...register(id)}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm 
          font-p text-slate-900 resize-vertical
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      {error && (
        <p className="text-red-500 font-subtle text-sm">
          {error.message}
        </p>
      )}
    </div>
  );
};