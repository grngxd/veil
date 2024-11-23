export type Colour = "blurple" | "red"

export const getColour = (colour: Colour) => {
    switch (colour) {
        case "blurple":
            return ["white", "var(--blurple-55)"];
        case "red":
            return ["white", "var(--red-400)"]; 
    }
}