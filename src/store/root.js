import { types } from 'mobx-state-tree'
import { Auth } from './auth'
import { useContext, createContext } from 'react'

const RootModel = types.model({
  auth: Auth,
})

sessionStorage.setItem('appId', import.meta.env.VITE_APP_ID)
sessionStorage.setItem('appName', '开发专用页面')
sessionStorage.setItem('pageId', import.meta.env.VITE_PAGE_ID)

const initialState = RootModel.create({
  auth: {
    accessToken: sessionStorage.getItem('accessToken') || '',
    refreshToken: sessionStorage.getItem('refreshToken') || '',
    timer: 0,
    authorization: {
      base: 'Basic ' + window.btoa('pig:pig'),
      yzm: 'Basic ' + window.btoa('app:app'),
      token: '',
    },
    app: {
      appId: sessionStorage.getItem('appId') || '',
      appName: sessionStorage.getItem('appName') || '',
    },
  },
})

export const rootStore = initialState

if (rootStore.auth.accessToken) {
  rootStore.auth.startCheckToken()
}
const RootScoreContext = createContext(RootModel)

export const Provider = RootScoreContext.Provider

export function useStore() {
  return useContext(RootScoreContext)
}
