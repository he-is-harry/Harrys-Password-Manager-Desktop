import React from 'react';
import { Outlet } from 'react-router-dom';
import { DrawerProvider } from './drawer-provider';
import { NavigationDrawer } from './navigation-drawer';

export function AuthorizedLayout(): React.JSX.Element {
  return (
    <DrawerProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <NavigationDrawer />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Outlet />
        </div>
      </div>
    </DrawerProvider>
  );
}
