import { css } from '@emotion/css';
import { h } from 'preact';
import { useState } from 'preact/hooks';

type TextBoxProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
};

const TextBox = ({ placeholder = "Placeholder...", value = '', onChange, onSubmit }: TextBoxProps) => {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
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
      value={inputValue}
      onInput={handleChange}
      onKeyPress={handleKeyPress}
      className={css({
        // width: '100%', 
        padding: '0.6rem 1rem',
        borderRadius: '4px',
        backgroundColor: '#202225',
        color: '#dcddde',
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        ":placeholder": {
          color: '#72767d',
        },
        ':focus': {
          backgroundColor: '#292b2f',
        },
        ':hover': {
          backgroundColor: '#242529',
        },
      })}
    />
  );
};

export default TextBox;