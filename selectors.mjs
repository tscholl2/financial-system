import { createSelector, isEmpty, memoize } from "./utils.mjs";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.5.3/dist/fuse.esm.js";

/*
Item: {
    category: "home"
    cost: 7.5
    date: Sat Jun 18 2022 00:00:00 GMT-0700 (Pacific Daylight Time) {}
    item: "laundry"
    location: "extended stay"
    notes: "per diem"
}

Filter: {
    [key]: {fn: "(i) => i.category == 'home'", description: "category = home",...},
}
*/

const filterToFunction = memoize((s) => eval(s));

export const selectItems = ({ items = [] }) => items;
export const selectSearch = ({ search = "" }) => search;
export const selectFilters = ({ filters = {} }) => filters;

export const selectFilteredItems = createSelector(
    selectItems,
    selectSearch,
    selectFilters,
    (items, search, filters) => {
        items = search === "" ? items : new Fuse(items, {
            keys: ["item", "location", "notes"]
        }).search(search).map(a => a.item);
        items = isEmpty(filters) ? items : items.filter(i => Object.values(filters).reduce((p, n) => p || filterToFunction(n.fn)(i), false));
        return items;
    });

export const selectCost = (item) => item.category === "income" ? item.cost : -item.cost;

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

export const selectTotal = createSelector(
    selectItems,
    (items) => items.reduce((p, n) => p + selectCost(n), 0)
);

export const selectFilteredTotal = createSelector(
    selectFilteredItems,
    (items) => items.reduce((p, n) => p + selectCost(n), 0)
);

export const selectStartDate = createSelector(
    selectItems,
    (items) => new Date(Math.min.apply(null, items.map(i => i.date)))
);
