import React, { useState, ReactNode } from 'react';
import { DrawerContext } from './drawer-context';

export function DrawerProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = (): void => setIsOpen(true);
  const closeDrawer = (): void => setIsOpen(false);
  const toggleDrawer = (): void => setIsOpen((prev) => !prev);

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}
