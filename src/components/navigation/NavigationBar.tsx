import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, User, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate('/perfil');
    } else {
      navigate('/login');
    }
  };

  // Filtrar items de navegación según el rol del usuario y la página actual
  const getNavigationItems = () => {
    const baseItems = [
      {
        icon: Home,
        label: 'Inicio',
        path: '/',
      },
      {
        icon: TrendingUp,
        label: 'Tendencias',
        path: '/tendencias',
      },
      {
        icon: User,
        label: 'Perfil',
        path: '/perfil',
      },
    ];

    // Solo mostrar "Crear evento" si estamos en EventListPage y el usuario es admin
    if (location.pathname === '/eventos' && user?.role === 'admin') {
      baseItems.unshift({
        icon: Plus,
        label: 'Crear evento',
        path: '/crear-evento',
      });
    }

    // Solo mostrar "Dashboard" si el usuario es admin
    if (user?.role === 'admin') {
      baseItems.splice(1, 0, {
        icon: Shield,
        label: 'Dashboard',
        path: '/eventos',
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="w-full h-[99px] bg-white shadow-sm border-b">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex-shrink-0">
          <img
            className="w-[100px] h-[99px] object-cover cursor-pointer"
            alt="Vive Medellín Logo"
            src="/assets/images/logo/vive.jpeg"
            onClick={() => handleNavigation('/')}
          />
        </div>

        <div className="flex items-center space-x-8">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={index}
                onClick={item.icon === User ? handleUserClick : () => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center h-auto p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <IconComponent className="w-6 h-6 mb-1" />
                <span className="text-xs font-small whitespace-pre-line text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
