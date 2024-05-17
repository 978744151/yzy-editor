/**
 * 组件专有动作选择器
 */

import { Select } from 'amis'
import React from 'react'

// 动作基本配置项
export const BASE_ACTION_PROPS = [
  'actionType',
  '__actionDesc',
  'preventDefault',
  'stopPropagation',
  'expression',
  // 'outputVar'
]

export default class CmptActionSelect extends React.Component {
  onChange(option) {
    const { formStore } = this.props
    let removeKeys = {}

    // 保留必须字段，其他过滤掉
    Object.keys(formStore.data).forEach((key) => {
      if (
        ![...BASE_ACTION_PROPS, 'componentId', '__rendererName', '__cmptTreeSource'].includes(key)
      ) {
        removeKeys[key] = undefined
      }
    })

    formStore.setValues({
      ...removeKeys,
      args: undefined,
      groupType: option.value,
      __cmptActionDesc: option.description,
    })

    this.props.onChange(option.value)
  }
  render() {
    const { data, formStore } = this.props
    // 根据type 从组件树中获取actions
    const actions = data.pluginActions[data.__rendererName] || []

    return (
      <Select
        value={formStore.data.groupType}
        className="cmpt-action-select"
        options={actions.map((item) => ({
          label: item.actionLabel,
          value: item.actionType,
          description: item.description,
        }))}
        onChange={this.onChange.bind(this)}
        clearable={false}
      />
    )
  }
}
