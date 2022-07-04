import { selectFilters } from "../selectors.mjs";
import { isEmpty } from "../utils.mjs";
import { h, text } from "../vendor/superfine.js";
import { Card } from "./common.mjs";

export function Filters(dispatch) {
    const handleClick = (e) => {
        const key = e.target.dataset.key;
        dispatch(s => icepick.unsetIn(s, ["filters", key]));
    }
    return function (state) {
        const filters = selectFilters(state);
        return Card("Filters",
            isEmpty(filters) ? text("No filters activated.") :
                h("ul", { id: "filters" }, Object.entries(filters).map(([k, { description }]) =>
                    h("li", {}, h("button", { onclick: handleClick, ["data-key"]: k }, text(description)))
                ))
        );
    }
}