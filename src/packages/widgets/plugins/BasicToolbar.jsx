import React from 'react'
import { toast } from 'amis'
import { BasePlugin, registerEditorPlugin } from 'amis-editor'

import SelectComp from '../components/selectComp'
import { getTid } from '@/utils/index.js'
import { autobind } from 'amis-core'

// import Api from '@/services/common'

export class MyBasicToolbarPlugin extends BasePlugin {
  static scene = ['layout']
  order = -9999
  @autobind
  async buildEditorContextMenu({ id, schema, region, info, selections }, menus) {
    const manager = this.manager
    const tenantId = getTid()

    const fetcher = this.manager.env.fetcher
    fetcher({
      url: '/admin/tenant/app/page/resources?pageId=' + sessionStorage.getItem('pageId'),
      method: 'get',
    }).then((res) => {
      if (res.data) {
        const { value } = this.getSchema(id)
        console.log(value, res.data)
        const tar = res.data.find((item) => {
          return item.code === value.id
        })
        if (tar) {
          // 已加入权限控制
          menus.unshift({
            label: '去除权限控制',
            onSelect: this.removePermission.bind(this, id, tar),
          })
        } else {
          menus.unshift({
            label: '加入权限控制',
            onSelect: this.addPermission.bind(this, id),
          })
        }
      }
    })

    menus.unshift(
      {
        label: '生成业务组件',
        onSelect: () => {
          console.log(this.manager)
          const store = this.manager.store
          const level = tid ? 'tenant' : 'platform'
          const params = {
            name: store.activeId,
            terminalType: 'PC',
            level: level,
            designJson: JSON.stringify(store.valueWithoutHiddenProps),
          }
          // Api.post({}, { postUrl: '/admin/component/design/add' })
        },
      },
      '|'
    )
  }

  getSchema(id) {
    const manager = this.manager
    const store = manager.store
    const node = store.getNodeById(id)
    const value = store.getValueOf(id)
    return { node, value }
  }

  addPermission(_id) {
    const { value, node } = this.getSchema(_id)
    const { type, label, title, id } = value
    const fetcher = this.manager.env.fetcher
    fetcher({
      url: '/admin/tenant/app/page/resource',
      method: 'post',
      data: {
        pageId: sessionStorage.getItem('pageId'),
        name: label || title,
        type,
        code: id,
      },
    }).then(() => {
      // console.log("value=>", value, node);
      this.manager.store.changeValueById(node.id, {
        ...value,
        visibleOn: "${ ARRAYINCLUDES(permissions,'id') }".replace(/id/g, value.id),
      })
      toast.success('加入权限控制成功')
      // 修改schema
    })
  }

  removePermission(id, item) {
    const fetcher = this.manager.env.fetcher
    const { value, node } = this.getSchema(id)
    fetcher({
      url: `/admin/tenant/app/page/resource/${item.id}`,
      method: 'delete',
    }).then(() => {
      const { visibleOn, ...rest } = value
      this.manager.store.changeValueById(node.id, rest)
      toast.success('去除权限控制成功')
      // 修改schema
    })
  }

  render() {
    const { render, ...rest } = this.props
    return <SelectComp></SelectComp>
  }
}

registerEditorPlugin(MyBasicToolbarPlugin)
