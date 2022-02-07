export const Controller = function () { return function (t) { var n = this; this.p = [], this.l = [], this.getState = function () { return n.s }, this.addPlugin = function (t) { n.p.push(t) }, this.removePlugin = function (t) { n.p = n.p.filter(function (n) { return n !== t }) }, this.addListener = function (t) { n.l.push(t) }, this.removeListener = function (t) { n.l = n.l.filter(function (n) { return n !== t }) }, this.dispatch = function (t) { n.p.forEach(function (n) { return t = n(t) }); var i = t(n.s); n.s !== i && (n.s = i, n.l.forEach(function (t) { return t(n.s, n.dispatch) })) }, this.s = t } }();

export function memoize(f) {
    const cache = {};
    return (...args) => {
        if (cache.args?.length !== args.length || args.some((a, i) => a !== cache.args[i])) {
            cache.args = args;
            cache.val = f(...args);
        }
        return cache.val;
    }
}

export function createSelector(...selectors) {
    const resulter = selectors.pop();
    return memoize((...args) => resulter(...selectors.map(f => f(...args))));
}

export function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

export function displayTimeSince(A, B) {
    const Ay = A.getFullYear();
    const By = B.getFullYear();
    const Am = A.getMonth();
    const Bm = B.getMonth();
    const Ad = A.getDate();
    const Bd = B.getDate();
    let M = 12 * (By - Ay) + (Bm - Am);
    const Y = Math.floor(M / 12);
    M = M % 12;
    let D = Bd - Ad;
    if (M !== 0) {
        D = Bd - daysInMonth(Am, Ay) - Ad;
    }
    return `Elapsed: ${Y} years, ${M} months, ${B.getDate() - A.getDate()} days`
}

export function overWrite(ptr = {}, obj = {}) {
    for (let k, v of Object.entries(obj)) {
        if (ptr.hasOwnProperty(k)) {
            if (typeof ptr[k] === "Object") {
                overWrite(ptr[k], v);
            } else {
                ptr[k] = v;
            }
        } else {
            ptr[k] = v;
        }
    }
}