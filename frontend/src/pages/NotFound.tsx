import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export default function NotFound({ message = 'This page does not exist.' }: { message?: string }) {
  return (
    <EmptyState icon={<SearchX className="h-5 w-5" />} title="Not found">
      {message}{' '}
      <Link to="/" className="font-medium text-indigo-600 hover:underline">Go to dashboard</Link>
    </EmptyState>
  );
}
