import { css } from '@emotion/css';
import { type ComponentChildren, h } from 'preact';
import { type Colour, getColour } from './colour';

type ButtonProps = {
  onClick: () => void;
  children: ComponentChildren;
  colour?: Colour;
};

const Button = ({ onClick, children, colour = "blurple" }: ButtonProps) => {

    const [text, button] = getColour(colour);

    return (
        <button
            type={"button"}
            onClick={onClick}
            className={
                css({
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    color: text,
                    backgroundColor: button,
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    ':hover': {
                        filter: "brightness(90%)",
                    },
                    ':active': {
                        filter: "brightness(80%)",
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