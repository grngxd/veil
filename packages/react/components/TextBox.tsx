import { css } from '@emotion/css';
// biome-ignore lint/style/useImportType: <explanation>
import { h } from 'preact';

type TextBoxProps = {
  className?: string;
  style?: string | h.JSX.CSSProperties;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
};

const TextBox = ({ placeholder = "Placeholder...", value = '', onChange, onSubmit, className, style }: TextBoxProps) => {
  let v = value;
  
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    v = target.value;
    if (onChange) {
      onChange(target.value);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={v}
      onInput={handleChange}
      onKeyPress={handleKeyPress}
      className={`${css({
        // width: '100%', 
        padding: '0.6rem 1rem',
        borderRadius: '4px',
        backgroundColor: 'var(--background-tertiary)',
        color: '#dcddde',
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        ":placeholder": {
          color: '#72767d',
        },
      })} ${className}`} 
      style={style}
    />
  );
};

export default TextBox;