import { css } from '@emotion/css';
import { type ComponentChildren, h } from 'preact';

type ButtonType = 'button' | 'submit' | 'reset';

type ButtonProps = {
  onClick: () => void;
  children: ComponentChildren;
  type?: ButtonType;           
};

const Button = ({ onClick, children, type = 'button' }: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={
                css({
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    color: "white",
                    backgroundColor: "#5865F2",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    ':hover': {
                        backgroundColor: "#4752C4"
                    },
                    ':active': {
                        backgroundColor: "#3C45A5"
                    },
                    ':disabled': {
                        backgroundColor: "#9BA4B4",
                        cursor: "not-allowed",
                    },
                })
            }
        >
            {children}
        </button>
    );
};

export default Button;