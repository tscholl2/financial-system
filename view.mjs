import { h, text } from "https://unpkg.com/superfine@8.2.0/index.js";
import { getIn, memoize, overWrite, setIn } from "./utils.mjs";
import { selectCategories, selectDescriptions, selectFilteredItems, selectLocations, selectStartDate, selectTotal, selectCost, selectTotalsByCategory, selectTotalsByLocation } from "./actions.mjs";

function Navbar() {
    return function () {
        return h("head", {}, [
            h("div", { class: "title-bar-text" }, text("Fin$")),
        ]);
    }
}

function ChartComponent(config) {
    const vnode = h("canvas", {});
    window.requestAnimationFrame(() => {
        if (vnode?.node == null) {
            console.error(`expected node, got nothing: ${vnode}`);
        }
        const oldChart = vnode.node._chart;
        if (oldChart) {
            // TODO: need to do a new chart if new chart type != old type
            overWrite(oldChart.data, config.data);
            oldChart.update();
        } else {
            vnode.node._chart = new Chart(vnode.node, config);
        }
    });
    return vnode;
}

function Card(title, children) {
    return h("div", { class: "window card" }, [
        h("div", { class: "title-bar" }, [
            h("div", { class: "title-bar-text" }, text(title))
        ]),
        h("div", { class: "window-body" }, children),
    ]);
}

function DailyChart(items) {
    items = [...items].sort((a, b) => a.date - b.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [];
    const data = items.reduce((p, n, i) => {
        const l = items[Math.max(i - 1, 0)];
        const sum = p[p.length - 1] + selectCost(n);
        if (n.date.toDateString() === l.date.toDateString()) {
            p[p.length - 1] = sum;
        } else {
            p.push(sum);
            labels.push(n.date.toDateString());
        }
        return p;
    }, [items[0].cost]).slice(1)
    const config = {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Daily Totals",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data,
            }]
        }
    }
    return ChartComponent(config);
}

function MonthlyChart(items) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getMonthYear = (d) => `${d.getMonth()}/${d.getFullYear()}`;
    items = [...items].sort((a, b) => a.date - b.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [];
    const data = items.reduce((p, n, i) => {
        const l = items[Math.max(i - 1, 0)];
        if (getMonthYear(n.date) === getMonthYear(l.date)) {
            p[p.length - 1] += selectCost(n);
        } else {
            p.push(selectCost(n));
            labels.push(`${months[n.date.getMonth()]} ${n.date.getFullYear()}`);
        }
        return p;
    }, [items[0].cost]).slice(1)
    const config = {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Monthly Totals",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data,
            }]
        }
    }
    return ChartComponent(config);
}

function BiggestCategory(state) {
    const categoryTotals = selectTotalsByCategory(state);
    let ck = "", cv = 0;
    for (let [k, v] of Object.entries(categoryTotals)) {
        if (v < cv && k != "income") {
            [ck, cv] = [k, v];
        }
    }
    const locationTotals = selectTotalsByLocation(state);
    let lk = "", lv = 0;
    for (let [k, v] of Object.entries(locationTotals)) {
        if (v < lv && k != "income") {
            [lk, lv] = [k, v];
        }
    }
    let ilk = "", ilv = 0;
    const incomeTotals = state.items.filter(i => i.category === "income").reduce((p, n) => {
        p[n.location] = (p[n.location] || 0) + selectCost(n);
        return p;
    }, {})
    for (let [k, v] of Object.entries(incomeTotals)) {
        if (v > ilv) {
            [ilk, ilv] = [k, v];
        }
    }

    const start = selectStartDate(state);
    const end = new Date();
    const months = ((end - start) / (1000 * 60 * 60 * 24 * 30));
    return Card("Biggest Incomes and Costs", h("ul", { id: "biggest-costs" }, [
        h("li", {}, text(`$${(cv / months).toFixed(2)} / month in ${ck.toLocaleUpperCase()}`)),
        h("li", {}, text(`$${(lv / months).toFixed(2)} / month at ${lk.toLocaleUpperCase()}`)),
        h("li", {}, text(`$${(ilv / months).toFixed(2)} / month from ${ilk.toLocaleUpperCase()}`)),
    ]));
}

function Content(dispatch) {
    return function (state) {
        if (state.search === "blank")
            return h("main", {});
        const items = selectFilteredItems(state);
        const delta = new Date() - selectStartDate(state);
        const total = selectTotal(state);
        const perDay = total / (delta / (1000 * 60 * 60 * 24));
        const perMonth = total / (delta / (1000 * 60 * 60 * 24 * 30));
        return h("main", {}, [
            h("ul", {}, [
                h("li", {}, Card("Daily Totals", [
                    h("span", { style: `color: ${perDay > 0 ? "green" : "red"}` }, text(`${perDay > 0 ? "+" : "-"}${perDay.toFixed(2)} / Day`)),
                    DailyChart(items),
                ])),
                h("li", {}, Card("Monthly Costs", [
                    h("span", { style: `color: ${perMonth > 0 ? "green" : "red"}` }, text(`${perMonth > 0 ? "+" : "-"}${perMonth.toFixed(2)} / Month`)),
                    MonthlyChart(items),
                ])),
                h("li", {}, BiggestCategory(state)),
            ])
        ]);
    }
}

function Sidebar(dispatch) {
    const handleSearchInput = (e) => {
        dispatch(s => ({ ...s, search: e.target.value }));
    }
    const filterViews = ["", " ✔️", " ✖️"];
    const handleFilterClick = (e) => {
        const d = e.target.dataset;
        dispatch(s => icepick.setIn(s, ["filter", d.filterKey], parseInt(d.filterValue, 10) + 1 % 3))
    };
    return function (state) {
        const { search = "", filter = {} } = state;
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
                            selectCategories(state).map(k => h("li", {
                                key: k,
                                onclick: handleFilterClick,
                                "data-filter-key": `c-${k}`,
                                "data-filter-value": filter[`c-${k}`] || 0,
                            },
                                text(`${k}${filterViews[filter[`c-${k}`] || 0]}`))),
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