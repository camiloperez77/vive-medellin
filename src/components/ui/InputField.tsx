import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'time';
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block font-subtitle text-slate-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm 
          font-p text-slate-900 h-10
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      {error && <p className="text-red-500 font-subtle text-sm">{error.message}</p>}
    </div>
  );
};
