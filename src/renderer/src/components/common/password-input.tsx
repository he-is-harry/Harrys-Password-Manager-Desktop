import { useState, DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';

type PasswordInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  // Add any custom props here if needed
};

export function PasswordInput(props: PasswordInputProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`password-input-container ${props.className || ''}`}>
      <input {...props} type={showPassword ? 'text' : 'password'} className="password-input" />
      <button
        type="button"
        className="password-toggle-button"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <IoEyeOff size={24} /> : <IoEye size={24} />}
      </button>
    </div>
  );
}
