import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';
import { 
  HomePage, 
  EventListPage, 
  CreateEventPage, 
  EventDetailPage, 
  NotFoundPage 
} from './pages';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/eventos" element={<EventListPage />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/crear-evento" element={<CreateEventPage />} />
        <Route path="/editar-evento/:id" element={<CreateEventPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;