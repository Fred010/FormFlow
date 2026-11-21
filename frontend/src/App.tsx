import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import PublicForm from './pages/PublicForm';
import Responses from './pages/Responses';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/forms/:id/responses" element={<Responses />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<Layout minimal />}>
        <Route path="/f/:slug" element={<PublicForm />} />
      </Route>
    </Routes>
  );
}
