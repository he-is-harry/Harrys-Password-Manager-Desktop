import React, { CSSProperties } from 'react';
import { Spinner } from './spinner';

interface LargeButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: CSSProperties;
  children: React.ReactNode;
}

export const LargeButton: React.FC<LargeButtonProps> = ({
  onClick,
  disabled,
  loading,
  children,
  style
}) => {
  return (
    <button className="large-button" onClick={onClick} disabled={disabled} style={style}>
      {loading ? <Spinner /> : <span className="button-text">{children}</span>}
    </button>
  );
};
