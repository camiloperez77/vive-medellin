import React from 'react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="font-h-1 text-slate-900 mb-4">404</h1>
      <p className="font-p text-slate-700 mb-8">
        La página que buscas no existe
      </p>
      <button className="bg-purple-700 text-white px-6 py-3 rounded-md font-body-medium hover:bg-purple-800">
        Volver al inicio
      </button>
    </div>
  );
};