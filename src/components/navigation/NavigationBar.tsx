import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, Plus, Search, User } from 'lucide-react';

const navigationItems = [
  {
    icon: Plus,
    label: "Crear evento",
    path: "/crear-evento",
  },
  {
    icon: Home,
    label: "Inicio",
    path: "/",
  },
  {
    icon: Calendar,
    label: "Eventos", 
    path: "/eventos",
  },
  {
    icon: Search,
    label: "Buscar",
    path: "/buscar",
  },
  {
    icon: User,
    label: "Perfil",
    path: "/perfil",
  },
];

export const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

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
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center h-auto p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-gray-100 text-gray-700'
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

        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-11 h-6 bg-purple-700 rounded-full">
            <span className="text-white text-xs">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
