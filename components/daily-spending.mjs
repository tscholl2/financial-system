import { Card, ChartComponent } from "./common.mjs";
import { createSelector } from "../utils.mjs";
import { selectCost, selectFilteredItems, selectFilteredTotal, selectStartDate } from "../selectors.mjs";
import { h, text } from "../vendor/superfine.js";

const dailyAverageSelector = createSelector(selectStartDate, selectFilteredTotal, (start, total) =>
    total / ((new Date() - start) / (1000 * 60 * 60 * 24)));

const dailyChartSelector = createSelector(selectFilteredItems, items => {
    items = [...items].sort((a, b) => a.date - b.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [items[0].date.toDateString()];
    const data = items.slice(1).reduce((p, n, i) => {
        const l = items[i];
        const sum = p[p.length - 1] + selectCost(n);
        if (n.date.toDateString() === l.date.toDateString()) {
            p[p.length - 1] = sum;
        } else {
            p.push(sum);
            labels.push(n.date.toDateString());
        }
        return p;
    }, [items[0].cost])
    const config = {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Daily Totals",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data,
            }]
        }
    }
    return ChartComponent(config);
});

export function DailySpending(state) {
    const chart = dailyChartSelector(state);
    const total = dailyAverageSelector(state);
    return Card("Daily Totals", [
        h("span", { style: `color: ${total > 0 ? "green" : "red"}` }, text(`Average = ${total > 0 ? "+" : "-"}${total.toFixed(2)} / Day`)),
        chart,
    ])
}
