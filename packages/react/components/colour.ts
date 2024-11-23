export type Colour = "blurple" | "red"

export const getColour = (colour: Colour) => {
    switch (colour) {
        case "blurple":
            return ["white", "#5865F2"];
        case "red":
            return ["white", "#ED4245"];
    }
}