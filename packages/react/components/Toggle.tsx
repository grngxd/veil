import { css } from '@emotion/css';
// biome-ignore lint/style/useImportType: <explanation>
import { h } from 'preact';
import { useState } from 'preact/hooks';

type ToggleProps = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

const Toggle = ({ label = '', checked = false, onChange }: ToggleProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const toggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
    <label className={`${toggleContainerStyle}`}>
      {label && <span className={labelStyle}>{label}</span>}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className={`${switchStyle} ${isChecked ? activeSwitchStyle : ''}`}
        onClick={toggle}
      >
        <div
          className={`${sliderStyle} ${isChecked ? activeSliderStyle : ''}`}
        />
      </div>
    </label>
  );
};

const toggleContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
});

const labelStyle = css({
  marginRight: '0.5rem',
  color: '#dcddde',
  fontSize: '16px',
});

const switchStyle = css({
  position: 'relative',
  width: '40px',
  height: '20px',
  backgroundColor: 'var(--background-tertiary)',
  borderRadius: '10px',
  transition: 'background-color 0.175s',
});

const activeSwitchStyle = css({
    backgroundColor: 'var(--green-400)',
  });

const sliderStyle = css({
  position: 'absolute',
  top: '2px',
  left: '2px',
  width: '16px', 
  height: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  transition: 'transform 0.175s, background-color 0.175s',
  transform: 'translateX(0)',
});

const activeSliderStyle = css({
  transform: 'translateX(20px)',
});

export default Toggle;