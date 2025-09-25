import React from 'react';
import { CreateEventForm } from '../components/forms/CreateEventForm';

export const CreateEventPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="font-h-1 text-slate-900 mb-4">
          Crear Evento
        </h1>
        <p className="font-p text-slate-700 max-w-3xl mx-auto">
          Cuéntanos de que se trata, dónde y cuándo se llevará a cabo y quien lo organiza. 
          Con esta información tu actividad podrá llegar a más personas y convertirse en parte 
          de la agenda cultural de la ciudad.
        </p>
      </header>

      <CreateEventForm />
    </div>
  );
};