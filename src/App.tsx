import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  HomePage,
  EventListPage,
  CreateEventPage,
  EventDetailPage,
  LoginPage,
  ProfilePage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/eventos"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EventListPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/eventos/:id" element={<EventDetailPage />} />
              <Route path="/crear-evento" element={<CreateEventPage />} />
              <Route path="/editar-evento/:id" element={<CreateEventPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
