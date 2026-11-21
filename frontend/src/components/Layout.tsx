import { FileText, Plus } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import Footer from './Footer';

export default function Layout({ minimal = false }: { minimal?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      {!minimal && (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="rounded-lg bg-indigo-600 p-1.5 text-white">
                <FileText className="h-4 w-4" />
              </span>
              FormFlow
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`
                }
              >
                Dashboard
              </NavLink>
              <Link
                to="/builder"
                className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" /> New Form
              </Link>
            </nav>
          </div>
        </header>
      )}
      <main className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 ${minimal ? 'max-w-2xl' : 'max-w-6xl'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
