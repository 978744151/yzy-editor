/**
 * 缓存等级枚举
 */
export const CACHE_LEVEL = {
  memory: 1,
  sessionStorage: 2,
  localStorage: 3,
}
/**
 * 缓存
 * @param {*} fn
 * @param {String | Function} key
 * @param {Number} level 缓存级别： 1--内存，2--sessionStorage， 3--localStorage
 * @returns
 */
export const memorize = function (fn, _key, level = 1) {
  const cache = {}
  const session = {}
  return async function (...args) {
    let key = null
    if (!_key) {
      key = JSON.stringify(args)
    } else if (typeof _key === 'function') {
      key = _key(...args)
    } else {
      key = _key
    }

    if (level === CACHE_LEVEL.memory) {
      return cache[key] || (cache[key] = fn.apply(fn, args)) // 如果已经缓存过，直接取值。否则重新计算并且缓存
    }

    if (level === CACHE_LEVEL.sessionStorage) {
      const cached = sessionStorage.getItem(key)
      if (cached) return JSON.parse(cached)
      return (
        session[key] ||
        (session[key] = fn.apply(fn, args).then((data) => {
          // todo 加判断，如果接口报错，不缓存
          sessionStorage.setItem(key, JSON.stringify(data))
          return data
        }))
      )
    }

    if (level === CACHE_LEVEL.localStorage) {
      const cached = localStorage.getItem(key)
      if (cached) return JSON.parse(cached)
      return (
        session[key] ||
        (session[key] = fn.apply(fn, args).then((data) => {
          // todo 加判断，如果接口报错，不缓存
          localStorage.setItem(key, JSON.stringify(data))
          return data
        }))
      )
    }
  }
}
