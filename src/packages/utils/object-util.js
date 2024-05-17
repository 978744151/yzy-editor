/**
 * 对象相等比较
 * @param {*} o1
 * @param {*} o2
 * @returns
 */
export const objectEquals = (obj1, obj2) => {
  let a = null
  let b = null
  if (Object.keys(obj2).length > Object.keys(obj1).length) {
    a = obj2
    b = obj1
  } else {
    a = obj1
    b = obj2
  }
  for (let key in a) {
    if (a[key] !== b[key]) return false
  }
  return true
}

/**
 * 判断是否为空对象
 * @param {*} obj
 * @returns
 */
export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0
}
