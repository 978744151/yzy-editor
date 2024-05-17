import axios from '@/plugins/axios'
import qs from 'qs'
import { rootStore } from '@/store/root'
const baseUrl = import.meta.env.VITE_PATH
export default {
  /**
   * 登录
   * @param {{username:string;password:string}} 登录信息
   * @param {{randomStr:string; code:string; grant_type:string; scope:string}} 验证码
   */
  login({ username, password }) {
    return axios({
      url:'/admin-api/system/auth/login',
      method: 'post',
      data: { username, password ,tenantName
        : 
        "芋道源码"},
      params: {
     
      },
      headers: {
        // isToken: false,
        // methodType: true,
        // Authorization: rootStore.auth.authorization.base,
        "Tenant-Id":1
      },
   
    })
  },
  /**
   * 检查token过期时间
   */
  checkToken() {
    // return axios({
    //   noTreat: true,
    //   url: baseUrl + '/token/check_token',
    //   method: 'get',
    //   params: { token: rootStore.auth.accessToken },
    //   headers: {
    //     Authorization: rootStore.auth.authorization.base,
    //   },
    // })
  },
  /**
   * 刷新token
   * @returns
   */
  refreshToken() {
    return axios({
      noTreat: true,
      url: baseUrl + '/oauth2/token',
      method: 'post',
      params: {
        refresh_token: rootStore.auth.refreshToken,
        grant_type: 'refresh_token',
        scope: 'server',
      },
      headers: {
        Authorization: rootStore.auth.authorization.base,
      },
    })
  },
  /**
   * 退出登录
   * @returns
   */
  logout() {
    return axios({
      url: baseUrl + '/token/logout',
      method: 'delete',
    })
  },
  getApiDetail(id) {
    return axios({
      url: `/admin/data/api/${id}`,
      method: 'get',
    })
  },
  getAmisDetail(id) {
    return axios({
      url: `/admin-api/system/amis/get?id=${id}`,
      method: 'get',
    })
  },
  putAmisDetail(data) {
    return axios({
      url: `/admin-api/system/amis/update`,
      method: 'put',
      data
    })
  },
}
