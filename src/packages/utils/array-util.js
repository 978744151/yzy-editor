export class SetCalculator {
  difference(setA, setB) {
    const positive = this.minus(setA, setB)
    const negative = this.minus(setB, setA)
    return {
      positive,
      negative,
    }
  }
  /**
   * setA - setB
   * @param {*} setA
   * @param {*} setB
   * @returns
   */
  minus(setA, setB) {
    const diff = new Set(setA)
    for (const elem of setB) {
      diff.delete(elem)
    }
    return diff
  }
}

export class ArrayCalculator {
  constructor() {
    this.setCalc = new SetCalculator()
  }

  difference(arrA, arrB) {
    const { positive, negative } = this.setCalc.difference(new Set(arrA), new Set(arrB))
    return {
      positive: [...positive],
      negative: [...negative],
    }
  }
}

/**
 * 顺序是否相等
 * @param {*} _arr1
 * @param {*} _arr2
 * @returns
 */
export const orderEqual = (_arr1, _arr2) => {
  if (_arr1.length !== _arr2.length) {
    return false
  }
  for (let i = 0; i < _arr1.length; i++) {
    if (_arr1.id !== _arr2.id) {
      return false
    }
  }
  return true
}
