import React from 'react';
import { LayoutProps } from '../types';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {children}
    </div>
  );
};