import { h, text } from "https://unpkg.com/superfine@8.2.0/index.js";
import { memoize } from "./utils.mjs";
import { selectCategories, selectDescriptions, selectFilteredItems, selectLocations, selectStartDate, selectTotal,getCost } from "./actions.mjs";

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
        console.log("updating chart!", vnode.node)
        if (vnode?.node == null) {
            console.error(`expected node, got nothing: ${vnode}`);
        }
        const oldChart = vnode.node._chart;
        console.log("old chart = ",oldChart)
        if (oldChart) {
            console.log("found old chart!")
            // TODO: we need to mutate not overwrite
            oldChart.data = config;
            oldChart.update();
        } else {
            console.log("making new chart!")
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

const DailyChart = memoize((items) => {
    items = [...items].sort((a, b) => a.date - b.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [];
    const data = items.reduce((p, n, i) => {
        const l = items[Math.max(i - 1, 0)];
        const sum = p[p.length - 1] + getCost(n);
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
});

function MonthlyCosts(items) {
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
            p[p.length - 1] += getCost(n);
        } else {
            p.push(getCost(n));
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

const MonthlyTotals = memoize((items) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getMonthYear = (d) => `${d.getMonth()}/${d.getFullYear()}`;
    items = [...items].sort((a, b) => a.date - b.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [];
    const data = items.reduce((p, n, i) => {
        const l = items[Math.max(i - 1, 0)];
        const sum = p[p.length - 1] + getCost(n);
        if (getMonthYear(n.date) === getMonthYear(l.date)) {
            p[p.length - 1] = sum;
        } else {
            p.push(sum);
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
});

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
                h("li", {}, Card("Monthly Totals", [
                    h("span", { style: `color: ${perMonth > 0 ? "green" : "red"}` }, text(`${perMonth > 0 ? "+" : "-"}${perMonth.toFixed(2)} / Month`)),
                    MonthlyTotals(items),
                ])),
                h("li", {}, Card("Monthly Costs", [
                    h("span", { style: `color: ${perMonth > 0 ? "green" : "red"}` }, text(`${perMonth > 0 ? "+" : "-"}${perMonth.toFixed(2)} / Month`)),
                    MonthlyCosts(items),
                ])),
            ])
        ]);
    }
}

function Footer() {
    return function () {
        return h("footer", {}, [
            text("Footer"),
        ]);
    }
}

function Sidebar(dispatch) {
    const handleInput = (e) => {
        dispatch(s => ({ ...s, search: e.target.value }));
    }
    return function (state) {
        return h("aside", { class: "sidebar" }, [
            h("ul", { class: "tree-view" }, [
                h("li", {},
                    h("form", { class: "field-row" }, [
                        h("label", { for: "search-input" }, text("Search")),
                        h("input", { id: "search-input", type: "text", oninput: handleInput }),
                    ])
                ),
                h("li", {}, text("Sections")),
                h("li", {}, [
                    h("details", {}, [
                        h("summary", {}, text("Averages")),
                    ]),
                    h("details", {}, [
                        h("summary", {}, text("Categories")),
                        h("ul", {},
                            selectCategories(state).map(c => h("li", { key: c }, text(c))),
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
    /*
    const inc = () => dispatch(s => ({ ...s, value: s.value - 1 }));
    const dec = () => dispatch(s => ({ ...s, value: s.value + 1 }));
    h("h1", {}, text(state.value)),
    h("button", { onclick: inc }, text("-")),
    h("button", { onclick: dec }, text("+")),
    */
    const sidebar = Sidebar(dispatch);
    const content = Content(dispatch);
    const navbar = Navbar(dispatch);
    const footer = Footer(dispatch);
    return function (state) {
        if (state.intializing) {
            return h("div", {}, [h("progress", {})]);
        }
        return h("div", {}, [
            navbar(state),
            sidebar(state),
            content(state),
            footer(state),
        ])
    }
}