function typeFactory(type) {
  return (value) => Object.prototype.toString.call(value) === type
}

export const TYPE_UTIL = {
  isArray: typeFactory('[object Array]'),
  isObject: typeFactory('[object Object]'),
  isFunction: typeFactory('[object Function]'),
  isString: typeFactory('[object String]'),
  isBoolean: typeFactory('[object Boolean]'),
}
