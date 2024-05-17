import axios from 'axios'
import { rootStore } from '@/store/root'

const instance = axios.create({
  baseURL: import.meta.env.VITE_PROXY,
  headers: {
    env: 'dev',
  },
})

instance.interceptors.request.use((config) => {
  if (config.noTreat) {
    return config
  }
  config.headers.Authorization =
    `Bearer ${rootStore.auth.accessToken}` || localstorage.getItem('pig-access_token')?.content

  return config
})

instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error
    if (response.status === 424) {
      rootStore.auth.clearToken()
    } else if (response.status === 401) {
      // 401 Unauthorized
      // todo 跳转登录页
      rootStore.auth.clearToken()
    } else if (response.status === 428) {
      alert(response.data.msg)
    }
    console.log(error)
    return response
  }
)

export default instance
