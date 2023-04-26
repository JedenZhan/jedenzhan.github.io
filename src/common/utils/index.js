export function formatNum(num) {
  return num?.toLocaleString();
}

export function debounce(fn, time) {
  let timer = null

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn(...args)
    }, time);
  }
}

function getType(p) {
  return Object.prototype.toString.call(p).slice(8, -1).toLowerCase()
}

export const typeUtils = {};

['String', 'Number'].forEach(e => {
  typeUtils[`is${e}`] = function (p) {
    return getType(p) === e.toLowerCase()
  }
});
