import React, { CSSProperties } from 'react';
import { Spinner } from './spinner';

interface LargeButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: CSSProperties;
  children: React.ReactNode;
}

export const LargeButton: React.FC<LargeButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'primary',
  children,
  style
}) => {
  return (
    <button
      className={variant === 'primary' ? 'large-button' : 'large-button-secondary'}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {loading ? (
        <Spinner />
      ) : (
        <span className={variant === 'primary' ? 'button-text' : 'button-text-secondary'}>
          {children}
        </span>
      )}
    </button>
  );
};
