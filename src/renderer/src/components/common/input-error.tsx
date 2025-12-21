import { IoAlertCircleOutline } from 'react-icons/io5';

export const InputError = ({
  error
}: {
  error: string | null | undefined;
}): React.JSX.Element | null => {
  return error ? (
    <div className="input-error-container">
      <IoAlertCircleOutline size={20} color="var(--color-error)" />
      <span className="input-error-text">{error}</span>
    </div>
  ) : null;
};
