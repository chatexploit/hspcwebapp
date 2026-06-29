'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { name: 'Settings', href: '/admin/settings' },
    { name: 'Staff Management', href: '/admin/staff' },
    // Add more dashboard links here later
  ];

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen flex bg-secondary-50">
      {/* Sidebar */}
      <div className="w-64 bg-secondary-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 text-2xl font-bold border-b border-secondary-800 flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-white text-sm">PC</span>
          </div>
          <span className="tracking-tight">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                pathname === item.href
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-secondary-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-secondary-300 font-medium hover:text-white hover:bg-secondary-800 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-secondary-200 z-10 shadow-sm">
          <div className="px-8 py-5 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-secondary-800 capitalize tracking-tight">
              {pathname.split('/').pop().replace('-', ' ')}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-secondary-200 rounded-full border-2 border-primary-100"></div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-50 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
