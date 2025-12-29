import { PropsWithChildren } from 'react';

export function BackgroundLayout({ children }: PropsWithChildren): React.JSX.Element {
  // In the desktop app, the body already has the background image (from main.css)
  // so we just need a layout container here.
  return <div className="background-layout">{children}</div>;
}
