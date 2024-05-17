import axios from '@/plugins/axios'
import qs from 'qs'

export default {
  // /component/design/add
  componentDesignAdd(data) {
    return axios({
      url: `/admin/component/design/add`,
      method: 'post',
      data,
    })
  },
}
