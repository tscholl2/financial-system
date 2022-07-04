import { selectFilteredItems } from "../selectors.mjs";
import { h, text } from "../vendor/superfine.js";
import { Card } from "./common.mjs";

/*
<table>
  <tr>
    <th>Company</th>
    <th>Contact</th>
    <th>Country</th>
  </tr>
  <tr>
    <td>Alfreds Futterkiste</td>
    <td>Maria Anders</td>
    <td>Germany</td>
  </tr>
  <tr>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td>Mexico</td>
  </tr>
</table>

Item: {
    category: "home"
    cost: 7.5
    date: Sat Jun 18 2022 00:00:00 GMT-0700 (Pacific Daylight Time) {}
    item: "laundry"
    location: "extended stay"
    notes: "per diem"
}
*/

export function Items(state) {
    const items = selectFilteredItems(state);
    return Card("Items", h("table", { id: "items-table" }, [
        h("tr", { key: "header" }, [
            h("th", {}, text("date")),
            h("th", {}, text("cost")),
            h("th", {}, text("category")),
            h("th", {}, text("description")),
            h("th", {}, text("location")),
            //h("th", {}, text("notes")),
        ])
    ].concat(items.map(i => h("tr", { key: JSON.stringify(i) }, [
        h("td", {}, text(i.date.toLocaleDateString())),
        h("td", {}, text(`$${i.cost.toLocaleString()}`)),
        h("td", {}, text(i.category)),
        h("td", {}, text(i.item)),
        h("td", {}, text(i.location)),
        //h("td", {}, text(i.notes)),
    ])))));
}
