import { ComponentType } from 'react';
import { IconBaseProps } from 'react-icons';
import { Spinner } from '../common/spinner';

interface InvertedIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ComponentType<IconBaseProps>;
  iconSize?: number;
  iconColor?: string;
  isLoading?: boolean;
}

export function InvertedIconButton({
  icon: Icon,
  iconSize = 20,
  iconColor = 'var(--color-white)',
  isLoading = false,
  className = '',
  disabled,
  ...buttonProps
}: InvertedIconButtonProps): React.JSX.Element {
  const combinedClassName = `inverted-icon-button ${className}`;

  return (
    <button className={combinedClassName} disabled={isLoading || disabled} {...buttonProps}>
      {isLoading ? (
        <Spinner size={iconSize} color={iconColor} />
      ) : (
        <Icon size={iconSize} color={iconColor} />
      )}
    </button>
  );
}
