import { CSSProperties, useCallback, useState } from 'react';
import { LargeButton } from '../common/large-button';
import { InputError } from '../common/input-error';
import { TextInput } from '../common/text-input';
import { FaSyncAlt } from 'react-icons/fa';
import OptionSlider from './option-slider';
import Slider from './slider';
import { PasswordInput } from '../common/password-input';

interface PasswordFormProps {
  initialName?: string;
  initialPassword?: string;
  submitButtonText: string;
  onSubmit: (name: string, password: string) => Promise<void>;
}

export function PasswordForm({
  initialName = '',
  initialPassword = '',
  submitButtonText,
  onSubmit
}: PasswordFormProps): React.JSX.Element {
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState(initialPassword);
  const [errors, setErrors] = useState<{ nameError?: string; passwordError?: string }>({});
  const [loading, setLoading] = useState(false);

  // Generator State
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [minUpper, setMinUpper] = useState(1);
  const [includeLower, setIncludeLower] = useState(true);
  const [minLower, setMinLower] = useState(1);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [minNumbers, setMinNumbers] = useState(1);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [minSymbols, setMinSymbols] = useState(1);

  const generatePassword = useCallback(async () => {
    try {
      const result = await window.api.passman.generatePassword({
        length,
        includeUppercase: includeUpper,
        includeLowercase: includeLower,
        includeNumbers: includeNumbers,
        includeSymbols: includeSymbols,
        minUppercase: minUpper,
        minLowercase: minLower,
        minNumbers: minNumbers,
        minSymbols: minSymbols
      });

      if (result.success && result.data) {
        setPassword(result.data);
      } else if (result.error) {
        window.alert('Failed to generate password: ' + result.error);
      }
    } catch (err) {
      window.alert('Failed to generate password: ' + (err as Error).message);
    }
  }, [
    length,
    includeUpper,
    minUpper,
    includeLower,
    minLower,
    includeNumbers,
    minNumbers,
    includeSymbols,
    minSymbols
  ]);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    if (!name || !password) {
      setErrors({
        nameError: name ? undefined : 'Name is required',
        passwordError: password ? undefined : 'Password is required'
      });
      setLoading(false);
      return;
    }

    await onSubmit(name, password);
    setLoading(false);
  };

  return (
    <div style={styles.formContainer}>
      <div style={styles.columnsContainer}>
        {/* Left Column: Inputs and Submit */}
        <div style={styles.leftColumn}>
          {/* Name Input Group */}
          <div style={styles.inputGroup}>
            <span className="body2">Name</span>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix"
            />
            <InputError error={errors.nameError} />
          </div>

          {/* Password Input Group */}
          <div style={styles.inputGroup}>
            <span className="body2">Password</span>
            <div style={styles.passwordContainer}>
              {/* Simulating PasswordInput component */}
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button
                className="fitted-button"
                style={styles.generateButton}
                onClick={generatePassword}
                title="Generate New Password"
              >
                <FaSyncAlt size={20} color="var(--color-pink)" />
              </button>
            </div>
            <InputError error={errors.passwordError} />
          </div>
          {/* Submit Button */}
          <LargeButton onClick={handleSubmit} loading={loading} style={styles.submitButton}>
            {submitButtonText}
          </LargeButton>
        </div>

        {/* Right Column: Generator Settings */}
        <div style={styles.rightColumn}>
          <div style={styles.generatorContainer}>
            <div className="body1" style={styles.sectionTitle}>
              Generator Settings
            </div>

            <div style={styles.lengthRow}>
              <span className="body3">Length: {length}</span>

              {/* Main Length Slider */}
              <Slider value={length} onValueChange={setLength} minimumValue={4} maximumValue={32} />
            </div>

            <OptionSlider
              label="Uppercase"
              included={includeUpper}
              setIncluded={setIncludeUpper}
              minCount={minUpper}
              setMinCount={setMinUpper}
            />
            <OptionSlider
              label="Lowercase"
              included={includeLower}
              setIncluded={setIncludeLower}
              minCount={minLower}
              setMinCount={setMinLower}
            />
            <OptionSlider
              label="Numbers"
              included={includeNumbers}
              setIncluded={setIncludeNumbers}
              minCount={minNumbers}
              setMinCount={setMinNumbers}
            />
            <OptionSlider
              label="Symbols"
              included={includeSymbols}
              setIncluded={setIncludeSymbols}
              minCount={minSymbols}
              setMinCount={setMinSymbols}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    paddingBottom: 8,
    width: '100%'
  },
  columnsContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
    width: '100%'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    flex: 1
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  passwordContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  submitButton: {
    marginTop: 8
  },
  generatorContainer: {
    backgroundColor: 'var(--color-white-10)',
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-white-20)',
    height: '100%'
  },
  generateButton: {
    paddingBlock: '8px',
    height: '48px'
  },
  sectionTitle: {
    marginBottom: 8,
    textAlign: 'left'
  },
  lengthRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 8
  }
};
