import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        richColors 
        closeButton 
        theme="system"
        toastOptions={{
          className: 'font-sans',
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 antialiased selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300">
        {children}
      </div>
    </>
  );
};

export default Layout;
