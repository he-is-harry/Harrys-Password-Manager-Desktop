import { CgSpinner } from 'react-icons/cg';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({
  size = 20,
  color = 'var(--color-white)'
}: SpinnerProps): React.JSX.Element {
  return <CgSpinner size={size} color={color} className="spinner-icon" />;
}
