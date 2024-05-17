import { types } from 'mobx-state-tree'

export const Application = types
  .model({
    appId: types.string,
    appName: types.string,
  })
  .actions((self) => ({
    setAppId(appId) {
      self.appId = appId
    },
    setAppName(appName) {
      self.appName = appName
    },
  }))
