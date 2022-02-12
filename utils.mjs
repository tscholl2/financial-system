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
    for (let [k, v] of Object.entries(obj)) {
        if (ptr.hasOwnProperty(k) && typeof ptr[k] === typeof v) {
            if (typeof ptr[k] === "Object") {
                overWrite(ptr[k], v);
            } else if (Array.isArray(ptr[k])) {
                while (ptr[k].length)
                    ptr[k].pop();
                while (v.length)
                    ptr[k].push(v.pop());
            } else {
                ptr[k] = v;
            }
        } else {
            ptr[k] = v;
        }
    }
    return ptr;
}

export function getIn(obj = {}, path = []) {
    return path.reduce((p, n) => p ? p[n] : undefined, obj);
}

export function setIn(obj = {}, path = [], value = undefined) {
    path.reduce((p, n, i) => i === path.length - 1 ? (p[n] = value) : (p[n] ? p[n] : p[n] = {}), obj);
    return obj;
}