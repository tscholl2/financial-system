import { createSelector } from "./utils.mjs";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.5.3/dist/fuse.esm.js";

export const selectItems = ({ items }) => items;

export const selectSearch = ({ search }) => search || "";

export const selectFilteredItems = createSelector(
    selectItems,
    selectSearch,
    (items, search) =>
        search === "" ? items : new Fuse(items, {
            shouldSort: false,
            tokenize: false,
            threshold: 0.5,
            location: 0,
            distance: 50,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["category", "item", "location"]
        }).search(search).map(a => a.item)
);

export const selectCost = (item) => item.category === "income" ? Math.abs(item.cost) : -Math.abs(item.cost);

function createSelectBy(property) {
    return items => Array.from(new Set(items.map(i => i[property].toLowerCase())));
}

export const selectCategories = createSelector(
    selectItems,
    createSelectBy("category"),
);

export const selectLocations = createSelector(
    selectItems,
    createSelectBy("location"),
);

export const selectDescriptions = createSelector(
    selectItems,
    createSelectBy("item"),
);

export const selectTotalsByCategory = createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n.category] = (p[n.category] || 0) + selectCost(n);
        return p;
    }, {})
);

export const selectTotalsByLocation = createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n.location] = (p[n.location] || 0) + selectCost(n);
        return p;
    }, {})
);

export const selectTotalsByDescription = createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n.item] = (p[n.item] || 0) + selectCost(n);
        return p;
    }, {})
);

export const selectTotal = createSelector(
    selectItems,
    (items) => items.reduce((p, n) => p + selectCost(n), 0)
);

export const selectStartDate = createSelector(
    selectItems,
    (items) => new Date(Math.min.apply(null, items.map(i => i.date)))
);
