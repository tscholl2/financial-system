import { Card, ChartComponent } from "./common.mjs";
import { createSelector } from "../utils.mjs";
import { selectCost, selectFilteredItems, selectFilteredTotal, selectStartDate } from "../selectors.mjs";
import { h, text } from "../vendor/superfine.js";


const monthlyAverageSelector = createSelector(selectStartDate, selectFilteredTotal, (start, total) => {
    const now = new Date();
    let months = now.getMonth() - start.getMonth();
    months += 12 * (now.getFullYear() - start.getFullYear());
    months = Math.max(months, 1);
    return total / months;
});

const monthlyChartSelector = createSelector(selectFilteredItems, items => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getMonthYear = (d) => `${d.getMonth()}/${d.getFullYear()}`;
    items = [...items].sort((a, b) => a.date - b.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [`${months[items[0].date.getMonth()]} ${items[0].date.getFullYear()}`];
    const data = items.slice(1).reduce((p, n, i) => {
        const l = items[i];
        if (getMonthYear(n.date) === getMonthYear(l.date)) {
            p[p.length - 1] += selectCost(n);
        } else {
            p.push(selectCost(n));
            labels.push(`${months[n.date.getMonth()]} ${n.date.getFullYear()}`);
        }
        return p;
    }, [items[0].cost])
    const config = {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Monthly Costs",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data,
            }]
        }
    }
    return ChartComponent(config);
});


export function MonthlySpending(state) {
    const chart = monthlyChartSelector(state);
    const total = monthlyAverageSelector(state);
    return Card("Monthly Spending", [
        h("span", { style: `color: ${total > 0 ? "green" : "red"}` }, text(`Average = ${total > 0 ? "+" : "-"}${total.toFixed(2)} / Day`)),
        chart,
    ])
}
