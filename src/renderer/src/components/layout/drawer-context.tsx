import { createContext, useContext } from 'react';

interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  openDrawer: () => null,
  closeDrawer: () => null,
  toggleDrawer: () => null
});

export function useDrawer(): DrawerContextType {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}
