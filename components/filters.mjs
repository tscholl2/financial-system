import { selectFilters } from "../selectors.mjs";
import { isEmpty } from "../utils.mjs";
import { h, text } from "../vendor/superfine.js";
import { Card } from "./common.mjs";

export function Filters(dispatch) {
    const handleClick = (e) => {
        // TODO
    }
    return function (state) {
        const filters = selectFilters(state);
        return Card("Filters",
            isEmpty(filters) ? text("No filters activated.") :
                h("ul", {}, Object.keys(filters).map(f =>
                    h("li", {}, h("button", { onclick: handleClick }, text(f)))
                ))
        );
    }
}