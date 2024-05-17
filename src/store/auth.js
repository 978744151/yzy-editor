import { flow, types } from 'mobx-state-tree'
import loginService from '@/services/login.js'
import { encryption } from '@/utils'
import { Application } from './application'
/**
 * 登录类型标识
 */
const base64 = (string) => {
  return window.btoa(string)
}
const Authorization = types
  .model('Authorization', {
    base: types.string, // 基础标识 密码登录 刷新token 检查token
    yzm: types.string, // 验证码登录标识
    token: types.string, // token认证
  })
  .actions((self) => ({
    setToken(accessToken) {
      if (accessToken) {
        self.token = `Bearer ${base64(accessToken)}`
      } else {
        self.token = ''
      }
    },
  }))

/**
 * 权限相关数据
 */
export const Auth = types
  .model('Auth', {
    accessToken: types.string,
    refreshToken: types.string,
    timer: types.number,
    authorization: Authorization,
    app: Application,
  })
  .actions((self) => {
    return {
      setAccessToken(token) {
        self.accessToken = token
        sessionStorage.setItem('accessToken', token)
        self.authorization.setToken(token)
      },
      setRefreshToken(token) {
        self.refreshToken = token
        sessionStorage.setItem('refreshToken', token)
      },
    }
  })
  .actions((self) => ({
    refresh: flow(function* refresh() {
      const res = yield loginService.refreshToken()
      if (res.data) {
        self.setAccessToken(res.data.access_token)
        self.setRefreshToken(res.data.refresh_token)
      }
    }),
  }))
  .actions((self) => ({
    startCheckToken() {
      self.timer = setInterval(() => {
        loginService.checkToken().then((res) => {
          //   console.log(res);
          if (res.data) {
            const restTime = res.data.exp * 1000 - new Date().getTime()
            if (restTime < 30 * 1000) {
              self.refresh()
            }
          }
        })
      }, 60 * 1000)
    },
    stopCheckToken() {
      clearInterval(self.timer)
    },
  }))
  .actions((self) => ({
    clearToken() {
      self.setAccessToken('')
      self.setRefreshToken('')
      self.stopCheckToken()
    },
  }))
  .actions((self) => ({
    /**
     * @param username 用户名
     * @param password 密码
     * @param code 验证码
     * @param randomStr 用来生成验证码的随机字符串
     */
    login: flow(function* login({ username, password, code, randomStr }) {
      const { data } = yield loginService.login(
        { username, password }
      )
      self.setAccessToken(data.data.accessToken)
      self.setRefreshToken(data.data.refreshToken)
      self.startCheckToken()
    }),
    logout: flow(function* logout() {
      yield loginService.logout()
      self.clearToken()
    }),
  }))
