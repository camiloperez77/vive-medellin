import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirigir automáticamente a HomePage si no hay usuario autenticado
  React.useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
  };

  // Mostrar loading mientras se verifica la autenticación
  if (!user) {
    return null; // No mostrar nada mientras redirige
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-purple-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Perfil de Usuario</h1>
            <p className="text-slate-600">Información de tu cuenta</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                <div className="bg-slate-50 px-4 py-2 rounded-md border">{user.name}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="bg-slate-50 px-4 py-2 rounded-md border">{user.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
                <div className="bg-slate-50 px-4 py-2 rounded-md border capitalize">
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ID de Usuario
                </label>
                <div className="bg-slate-50 px-4 py-2 rounded-md border font-mono text-sm">
                  {user.id}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
