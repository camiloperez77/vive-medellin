import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FileUploadFieldProps {
  id: string;
  label: string;
  accept?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  description?: string;
  className?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  id,
  label,
  accept = 'image/*',
  register,
  error,
  required = false,
  description,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewUrl(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label htmlFor={id} className="block font-subtitle text-slate-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="font-subtle text-gray-600 text-sm">
          {description}
        </p>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            id={id}
            type="file"
            accept={accept}
            {...register(id)}
            ref={fileInputRef}
            onChange={handleFileChange}
            className={`
              block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
        
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Quitar
          </button>
        )}
      </div>

      {/* Vista previa de la imagen */}
      {previewUrl && (
        <div className="mt-3">
          <p className="font-subtle text-gray-600 text-sm mb-2">Vista previa:</p>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="h-32 w-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 font-subtle text-sm">
          {error.message}
        </p>
      )}
    </div>
  );
};