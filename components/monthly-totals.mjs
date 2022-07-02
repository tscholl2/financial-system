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
    const getMonthYear = (d) => `${months[d.getMonth()]} ${d.getFullYear()}`;
    items = [...items].sort((a, b) => b.date - a.date);
    if (items.length === 0) {
        return h("span", {}, text("No items :("));
    }
    const labels = [getMonthYear(items[0].date)];
    const data = items.slice(1).reduce((p, n, i) => {
        const l = items[i];
        const sum = p[p.length - 1] + selectCost(n);
        if (getMonthYear(n.date) === getMonthYear(l.date)) {
            p[p.length - 1] = sum;
        } else {
            p.push(sum);
            labels.push(getMonthYear(n.date));
        }
        return p;
    }, [items[0].cost])
    const config = {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Monthly Totals",
                backgroundColor: "#690bc0",
                borderColor: "#690bc0",
                data,
            }]
        }
    }
    return ChartComponent(config);
});


export function MonthlyTotal(state) {
    const chart = monthlyChartSelector(state);
    const total = monthlyAverageSelector(state);
    return Card("Monthly Totals", [
        h("span", { style: `color: ${total > 0 ? "green" : "red"}` }, text(`Average = ${total.toFixed(2)} / Month`)),
        chart,
    ])
}
