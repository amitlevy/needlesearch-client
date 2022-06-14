// get score, return color
export function get_score_color(score:number) {
    if (score > 85) {
        return "#1EA896";
    }
    else if (score > 65) {
        return "#E8871E";
    }
    else {
        return "#C62828";
    }
}
