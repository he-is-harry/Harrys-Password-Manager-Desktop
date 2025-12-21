import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

type TextInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  // Add any custom props here if needed
};

export function TextInput(props: TextInputProps): React.JSX.Element {
  return (
    <div className={`text-input-container ${props.className || ''}`}>
      <input {...props} className="text-input" />
    </div>
  );
}
