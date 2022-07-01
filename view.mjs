//import { h,text } from "https://unpkg.com/superfine@8.2.0/index.js";
import { h, text } from "./vendor/superfine.js";
import { selectCategories, selectDescriptions, selectFilteredItems, selectLocations, selectStartDate, selectCost, selectTotalsByCategory, selectTotalsByLocation, selectItems } from "./selectors.mjs";
import { DailySpending } from "./components/daily-spending.mjs";
import { MonthlySpending } from "./components/monthly-spending.mjs";
import { Card } from "./components/common.mjs";
import { Filters } from "./components/filters.mjs";


function Navbar() {
    return function () {
        return h("head", {}, [
            h("div", { class: "title-bar-text" }, text("Fin$")),
        ]);
    }
}

function BiggestIncomes(state) {
    const incomeTotals = selectItems(state).filter(i => i.category === "income").reduce((p, n) => {
        p[n.location] = (p[n.location] || 0) + selectCost(n);
        return p;
    }, {})
    const sortedTotals = Object.entries(incomeTotals).sort((a, b) => a[1] - b[1]);
    const start = selectStartDate(state);
    const end = new Date();
    const months = ((end - start) / (1000 * 60 * 60 * 24 * 30));
    return Card(
        "Biggest Incomes",
        h("ul", { id: "biggest-costs" },
            sortedTotals.reverse().slice(0, 5).map(([k, v]) => h("li", {}, text(`$${(v / months).toFixed(2)} / month in ${k.toLocaleUpperCase()}`)))
        ),
    );
}
function BiggestCategories(state) {
    const categoryTotals = selectTotalsByCategory(state);
    const sortedTotals = Object.entries(categoryTotals).sort((a, b) => a[1] - b[1]);
    const start = selectStartDate(state);
    const end = new Date();
    const months = ((end - start) / (1000 * 60 * 60 * 24 * 30));
    return Card(
        "Biggest Categories",
        h("ul", { id: "biggest-costs" },
            sortedTotals.slice(0, 5).map(([k, v]) => h("li", {}, text(`$${(v / months).toFixed(2)} / month in ${k.toLocaleUpperCase()}`)))
        ),
    );
}

function BiggestLocations(state) {
    const locationTotals = selectTotalsByLocation(state);
    const sortedTotals = Object.entries(locationTotals).sort((a, b) => a[1] - b[1]);
    const start = selectStartDate(state);
    const end = new Date();
    const months = ((end - start) / (1000 * 60 * 60 * 24 * 30));
    return Card(
        "Biggest Locations",
        h("ul", { id: "biggest-costs" },
            sortedTotals.slice(0, 5).map(([k, v]) => h("li", {}, text(`$${(v / months).toFixed(2)} / month in ${k.toLocaleUpperCase()}`)))
        ),
    );
}

function Content(dispatch) {
    const filters = Filters(dispatch);
    return function (state) {
        if (state.search === "blank")
            return h("main", {});
        return h("main", {}, [
            h("ul", {}, [
                h("li", {}, filters(state)),
                h("li", {}, MonthlySpending(state)),
                h("li", {}, DailySpending(state)),
                h("li", {}, BiggestCategories(state)),
                h("li", {}, BiggestLocations(state)),
                h("li", {}, BiggestIncomes(state)),
            ])
        ]);
    }
}

function Item(item) {
    return text(`${item.date.toDateString()}: $${item.cost} ${item.item}${item.notes ? ` ${item.notes}` : ""}`);
}

function Sidebar(dispatch) {
    const handleSearchInput = (e) => {
        dispatch(s => ({ ...s, search: e.target.value }));
    }
    const handleFilterClick = (e) => {
        const d = e.target.dataset;
        const [property, value, status] = [d.filterProperty, d.filterValue, d.filterStatus];
        const next_status = (parseInt(status, 10) + 1) % 3;
        const k = `${property}-${value}`;
        dispatch(s => {
            if (next_status > 0) {
                const f = (next_status === 1)
                    ? { status: next_status, description: `${property} = ${value}`, fn: `(i) => i.${property} === "${value}"` }
                    : { status: next_status, description: `${property} ≠ ${value}`, fn: `(i) => i.${property} !== "${value}"` };
                return icepick.setIn(s, ["filters", k], f);
            } else {
                return icepick.unsetIn(s, ["filters", k]);
            }
        });
    };
    return function (state) {
        const { search = "", filters = {} } = state;
        const filteredItems = selectFilteredItems(state);
        return h("aside", { class: "sidebar" }, [
            h("ul", { class: "tree-view" }, [
                h("li", {},
                    h("form", { class: "field-row" }, [
                        h("label", { for: "search-input" }, text("Search")),
                        h("input", { id: "search-input", type: "text", oninput: handleSearchInput, value: search }),
                    ])
                ),
                h("li", {}, text("Sections")),
                h("li", {}, [
                    h("details", {}, [
                        h("summary", {}, text("Categories")),
                        h("ul", {},
                            selectCategories(state).map(v => h("li", {
                                key: v,
                                onclick: handleFilterClick,
                                "data-filter-property": `category`,
                                "data-filter-value": `${v}`,
                                "data-filter-status": `${filters[`category-${v}`]?.status || 0}`,
                            },
                                text(v + ["", " ✔️", " ✖️"][filters[`category-${v}`]?.status || 0]))),
                        ),
                    ]),
                    h("details", {}, [
                        h("summary", {}, text("Locations")),
                        h("ul", {},
                            selectLocations(state).map(c => h("li", { key: c }, text(c))),
                        ),
                    ]),
                    h("details", {}, [
                        h("summary", {}, text("Descriptions")),
                        h("ul", {},
                            selectDescriptions(state).map(c => h("li", { key: c }, text(c))),
                        ),
                    ]),
                    h("details", {}, [
                        h("summary", {}, text("Items")),
                        h("ul", {},
                            selectItems(state).map(c => h("li", { key: c, class: filteredItems.indexOf(c) < 0 ? "filtered" : "" }, Item(c))),
                        ),
                    ]),
                ]),
            ]),
        ]);
    }
}

export function App(dispatch) {
    const sidebar = Sidebar(dispatch);
    const content = Content(dispatch);
    const navbar = Navbar(dispatch);
    return function (state) {
        if (state.intializing) {
            return h("div", {}, [h("progress", {})]);
        }
        return h("div", {}, [
            navbar(state),
            sidebar(state),
            content(state),
        ])
    }
}