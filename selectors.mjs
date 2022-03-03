import { createSelector } from "./utils.mjs";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.5.3/dist/fuse.esm.js";

export const selectItems = ({ items = [] }) => items;

export const selectSearch = ({ search = "" }) => search;

export const selectFilter = ({ filter = {} }) => filter;

function searchItems(items = [], search = "") {
    return search === "" ? items : new Fuse(items, {
        shouldSort: false,
        tokenize: false,
        threshold: 0.5,
        location: 0,
        distance: 50,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["category", "item", "location"]
    }).search(search).map(a => a.item)
}

function filterItems(items = [], filter = {}) {
    let included = [];
    let excluded = [];
    for (let [k, v] of Object.entries(filter)) {
        if (v === 1) {
            included.push(k);
        }
        if (v === 2) {
            excluded.push(k);
        }
    }
    return items.filter(item => {
        const c = filter[`c-${item.category}`] || 0;
        const l = filter[`l-${item.category}`] || 0;
        const d = filter[`d-${item.category}`] || 0;
        if (included.length > 0) {
            return (c == 1) || (l == 1) || (d == 1);
        } else {
            return (c != 2) && (l != 2) && (d != 2);
        }
    })
}

export const selectFilteredItems = createSelector(
    selectItems,
    selectSearch,
    selectFilter,
    (items, search, filter) => searchItems(filterItems(items, filter), search)
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

const createSelectTotalsByProperty = property => createSelector(
    selectItems,
    items => items.reduce((p, n) => {
        p[n[property]] = (p[n[property]] || 0) + selectCost(n);
        return p;
    }, {})
);

export const selectTotalsByCategory = createSelectTotalsByProperty("category");

export const selectTotalsByLocation = createSelectTotalsByProperty("location");

export const selectTotalsByDescription = createSelectTotalsByProperty("item");

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
