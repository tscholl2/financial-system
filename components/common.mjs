import { h, text } from "../vendor/superfine.js";
import { overWrite } from "../utils.mjs";

export function ChartComponent(config) {
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

export function Card(title, children) {
    return h("div", { class: "window card" }, [
        h("div", { class: "title-bar" }, [
            h("div", { class: "title-bar-text" }, text(title))
        ]),
        h("div", { class: "window-body" }, children),
    ]);
}