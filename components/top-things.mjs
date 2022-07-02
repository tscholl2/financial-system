import { selectCost, selectFilteredItems, selectStartDate } from "../selectors.mjs";
import { createSelector } from "../utils.mjs";
import { h, text } from "../vendor/superfine.js";
import { Card, ChartComponent } from "./common.mjs";

const countMonths = createSelector(selectStartDate, (start) => {
    const end = new Date();
    return 1 + end.getMonth() + end.getFullYear() * 12 - start.getMonth() - start.getFullYear() * 12;
});

const createSelectTotalsByProperty = property => createSelector(
    selectFilteredItems,
    items => items.reduce((p, n) => {
        p[n[property]] = (p[n[property]] || 0) + selectCost(n);
        return p;
    }, {})
);
const selectTotalsByCategory = createSelectTotalsByProperty("category");
const selectTotalsByLocation = createSelectTotalsByProperty("location");

export function TopIncomes(state) {
    const total = (selectTotalsByCategory(state)["income"] || 0) / countMonths(state);
    const items = selectFilteredItems(state);
    const months = countMonths(state);
    const totalsByLocation = items.filter(i => i.category === "income").reduce((p, n) => {
        p[n.location] = (p[n.location] || 0) + selectCost(n);
        return p;
    }, {});
    const sortedTotals = Object.entries(totalsByLocation).sort((a, b) => b[1] - a[1]);
    const data = sortedTotals.slice(0, 5).map(([_, v]) => v / months);
    const labels = sortedTotals.slice(0, 5).map(([k, _]) => k.toLowerCase());
    return Card("Top Incomes", [
        h("span", { style: `color: ${total > 0 ? "green" : "red"}` }, text(`Average = ${total > 0 ? "+" : "-"}${total.toFixed(2)} / Month`)),
        ChartComponent({
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Top Incomes",
                    backgroundColor: "#690bc0",
                    borderColor: "#690bc0",
                    data,
                }]
            }
        }),
    ]);
}

export function TopCategories(state) {
    const totals = selectTotalsByCategory(state);
    const months = countMonths(state);
    const sortedTotals = Object.entries(totals).filter(([k, _]) => k !== "income").sort((a, b) => a[1] - b[1]);
    const data = sortedTotals.slice(0, 5).map(([_, v]) => -v / months);
    const labels = sortedTotals.slice(0, 5).map(([k, _]) => k.toLowerCase());
    return Card("Top Categories", ChartComponent({
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Top Categories",
                backgroundColor: "#690bc0",
                borderColor: "#690bc0",
                data,
            }]
        }
    }));
}

export function TopLocations(state) {
    const totals = selectTotalsByLocation(state);
    const months = countMonths(state);
    const sortedTotals = Object.entries(totals).filter(([_, v]) => v < 0).sort((a, b) => a[1] - b[1]);
    const data = sortedTotals.slice(0, 5).map(([_, v]) => -v / months);
    const labels = sortedTotals.slice(0, 5).map(([k, _]) => k.toLowerCase());
    return Card(
        "Top Locations",
        ChartComponent({
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Top Locations",
                    backgroundColor: "#690bc0",
                    borderColor: "#690bc0",
                    data,
                }]
            }
        }),
    );
}
