import CryptoJS from 'crypto-js'
import { saveAs } from 'file-saver'
/**
 * 生成随机数字
 * @param {Number} length 长度
 * @returns
 */
export const getRandomNumber = (length = 4) => {
  let str = ''
  for (let i = 0; i < length; i++) {
    str += String(Math.ceil(Math.random() * 10))[0]
  }
  return str
}

export const randomLenNum = (len, date) => {
  let random = ''
  random = Math.ceil(Math.random() * 100000000000000)
    .toString()
    .substr(0, len || 4)
  if (date) random = random + Date.now()
  return random
}

/**
 * 加密处理
 * @param {*} params
 * @returns
 */
export const encryption = (params) => {
  let { data, type, param, key } = params
  const result = JSON.parse(JSON.stringify(data))
  if (type === 'Base64') {
    param.forEach((ele) => {
      result[ele] = btoa(result[ele])
    })
  } else {
    param.forEach((ele) => {
      var data = result[ele]
      key = CryptoJS.enc.Latin1.parse(key)
      var iv = key
      // 加密
      var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding,
      })
      result[ele] = encrypted.toString()
    })
  }
  return result
}

/**
 * 下载JSON
 * @param {*} json
 */
export function downloadJSON(json, space = 2) {
  const fileStream = JSON.stringify(json, undefined, space)
  const blob = new Blob([fileStream])
  saveAs(blob, `${new Date().getTime()}.json`)
}

export function getTid() {
  const path = window.location.hash.split('?')[0].split('/').reverse()
  const index = path.findIndex((e) => e.includes('tenant'))
  if (index !== -1) return path[0]
}
