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

export const getCost = (item) => item.category === "income" ? Math.abs(item.cost) : -Math.abs(item.cost);

export const selectCategories = createSelector(
    selectItems,
    items => Array.from(new Set(items.map(i => i["category"].toLowerCase())))
);

export const selectLocations = createSelector(
    selectItems,
    items => Array.from(new Set(items.map(i => i["location"].toLowerCase())))
);

export const selectDescriptions = createSelector(
    selectItems,
    items => Array.from(new Set(items.map(i => i["item"].toLowerCase())))
);

export const selectTotalsByCategory = createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n.category] = (p[n.category] || 0) + getCost(n);
        return p;
    }, {})
);

export const selectTotalsByLocation = createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n.location] = (p[n.location] || 0) + getCost(n);
        return p;
    }, {})
);

export const selectTotalsByDescription = createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n.item] = (p[n.item] || 0) + getCost(n);
        return p;
    }, {})
);

export const selectTotal = createSelector(
    selectItems,
    (items) => items.reduce((p, n) => p + getCost(n), 0)
);

export const selectStartDate = createSelector(
    selectItems,
    (items) => new Date(Math.min.apply(null, items.map(i => i.date)))
);
