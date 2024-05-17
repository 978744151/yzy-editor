import request from '@/plugins/axios'
/**
 * @...reset
 */
const common = {
  getList: (params = {}, { getList = '', id = '' }) => {
    return request({
      url: getList + id,
      method: 'get',
      params,
    })
  },

  post: (data = {}, { postUrl = '', postMethod = 'post' }) => {
    return request({
      url: postUrl,
      method: postMethod,
      data,
    })
  },
  del: (id, { delUrl = '', delMethod = 'delete' }, params = {}) => {
    return request({
      url: delUrl + id,
      method: delMethod,
      params,
    })
  },
  put: (data, { putUrl = '', putMethod = 'put' }) => {
    return request({
      url: putUrl,
      method: putMethod,
      data,
    })
  },
}
export default common
