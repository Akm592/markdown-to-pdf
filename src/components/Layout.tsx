import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Toaster position="bottom-right" richColors closeButton theme="system" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 antialiased">
        {children}
      </div>
    </>
  );
};

export default Layout;
