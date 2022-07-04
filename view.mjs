//import { h,text } from "https://unpkg.com/superfine@8.2.0/index.js";
import { h, text } from "./vendor/superfine.js";
import { selectCategories, selectDescriptions, selectFilteredItems, selectLocations, selectItems } from "./selectors.mjs";
import { MonthlySpending } from "./components/monthly-spending.mjs";
import { Filters } from "./components/filters.mjs";
import { MonthlyTotal } from "./components/monthly-totals.mjs";
import { TopCategories, TopIncomes, TopLocations } from "./components/top-things.mjs";
import { Items } from "./components/items.mjs";


function Navbar() {
    return function () {
        return h("head", {}, [
            h("div", { class: "title-bar-text" }, text("Fin$")),
        ]);
    }
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
                h("li", {}, MonthlyTotal(state)),
                h("li", {}, TopCategories(state)),
                h("li", {}, TopLocations(state)),
                h("li", {}, TopIncomes(state)),
                h("li", {}, Items(state)),
            ])
        ]);
    }
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
                            selectLocations(state).map(v => h("li", {
                                key: v,
                                onclick: handleFilterClick,
                                "data-filter-property": `location`,
                                "data-filter-value": `${v}`,
                                "data-filter-status": `${filters[`location-${v}`]?.status || 0}`,
                            },
                                text(v + ["", " ✔️", " ✖️"][filters[`location-${v}`]?.status || 0]))),
                        ),
                    ]),
                    h("details", {}, [
                        h("summary", {}, text("Descriptions")),
                        h("ul", {},
                            selectDescriptions(state).map(v => h("li", {
                                key: v,
                                onclick: handleFilterClick,
                                "data-filter-property": `description`,
                                "data-filter-value": `${v}`,
                                "data-filter-status": `${filters[`description-${v}`]?.status || 0}`,
                            },
                                text(v + ["", " ✔️", " ✖️"][filters[`description-${v}`]?.status || 0]))),
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