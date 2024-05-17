import { Renderer, unRegisterRenderer } from 'amis'
import CRUD from 'amis/lib/renderers/CRUD'
import React from 'react'
import { CRUDStore } from 'amis-core'
unRegisterRenderer('crud')

@Renderer({
  name: 'crud',
  storeType: CRUDStore.name,
  isolateScope: true,
})
export class MyCRUD extends CRUD {
  handleBulkAction(selectedItems, unSelectedItems, e, action) {
    console.log('haha')
    const {
      store,
      primaryField,
      onAction,
      messages,
      pageField,
      stopAutoRefreshWhenModalIsOpen,
      env,
    } = this.props

    if (!selectedItems.length && action.requireSelected !== false) {
      return
    }

    let ids = selectedItems
      .map((item) => (item.hasOwnProperty(primaryField) ? item[primaryField] : null))
      .filter((item) => item)
      .join(',')

    const ctx = createObject(store.mergedData, {
      ...selectedItems[0],
      currentPageData: (store.mergedData?.items || []).concat(),
      rows: selectedItems,
      items: selectedItems,
      selectedItems,
      unSelectedItems: unSelectedItems,
      ids,
    })

    let fn = () => {
      if (action.actionType === 'dialog') {
        return this.handleAction(
          e,
          {
            ...action,
            __from: 'bulkAction',
          },
          ctx
        )
      } else if (action.actionType === 'ajax') {
        isEffectiveApi(action.api, ctx) &&
          store
            .saveRemote(action.api, ctx, {
              successMessage:
                (action.messages && action.messages.success) || (messages && messages.saveSuccess),
              errorMessage:
                (action.messages && action.messages.failed) || (messages && messages.saveFailed),
            })
            .then(async (payload) => {
              const data = createObject(ctx, payload)
              if (action.feedback && isVisible(action.feedback, data)) {
                await this.openFeedback(action.feedback, data)
                stopAutoRefreshWhenModalIsOpen && clearTimeout(this.timer)
              }

              action.reload
                ? this.reloadTarget(filterTarget(action.reload, data), data)
                : this.search({ [pageField || 'page']: 1 }, undefined, true, true)
              action.close && this.closeTarget(action.close)

              const redirect = action.redirect && filter(action.redirect, data)
              redirect && env.jumpTo(redirect, action)
            })
            .catch(() => null)
      } else if (onAction) {
        onAction(e, action, ctx, false, this.context)
      }
    }

    // Action如果配了事件动作也会处理二次确认，这里需要处理一下忽略
    let confirmText = ''
    if (
      !action.ignoreConfirm &&
      action.confirmText &&
      env.confirm &&
      (confirmText = filter(action.confirmText, ctx))
    ) {
      env
        .confirm(confirmText, filter(action.confirmTitle, ctx) || undefined)
        .then((confirmed) => confirmed && fn())
    } else {
      fn()
    }
  }
}
