import React from 'react'
import APIControl from 'amis-editor/lib/renderer/APIControl'
import { isObject, tipedLabel, getSchemaTpl } from 'amis-editor-core'
import { FormItem, Icon } from 'amis'
class MyControlProps extends APIControl {
  static order = -9999
  static priority = 1000
  renderApiDialog() {
    return {
      label: '',
      type: 'action',
      acitonType: 'dialog',
      size: 'sm',
      icon: <Icon icon="setting" className="icon ae-ApiControl-icon" />,
      className: 'ae-ApiControl-setting-button',
      actionType: 'dialog',
      dialog: {
        title: '高级设置1',
        size: 'md',
        className: 'ae-ApiControl-dialog',
        headerClassName: 'font-bold',
        bodyClassName: 'ae-ApiControl-dialog-body',
        closeOnEsc: true,
        closeOnOutside: false,
        showCloseButton: true,
        // data: {},
        body: [this.renderApiConfigTabs()],
      },
    }
  }
  renderApiConfigTabs(submitOnChange) {
    console.log(1234)
    const { messageDesc, debug = false, name } = this.props

    return {
      type: 'form',
      className: 'ae-ApiControl-form',
      mode: 'horizontal',
      submitOnChange,
      wrapWithPanel: false,
      onSubmit: this.handleSubmit,
      debug,
      body: [
        {
          type: 'tabs',
          className: 'ae-ApiControl-tabs',
          contentClassName: 'ae-ApiControl-tabContent',
          tabs: [
            {
              title: '接口设置1223',
              tab: [
                {
                  label: '发送方式',
                  name: 'method',
                  value: 'get',
                  type: 'button-group-select',
                  mode: 'horizontal',
                  options: [
                    {
                      value: 'get',
                      label: 'GET',
                    },
                    {
                      value: 'post',
                      label: 'POST',
                    },
                    {
                      value: 'put',
                      label: 'PUT',
                    },
                    {
                      value: 'patch',
                      label: 'PATCH',
                    },
                    {
                      value: 'delete',
                      label: 'DELETE',
                    },
                  ],
                },
                {
                  label: '接口地址1221',
                  type: 'input-text',
                  name: 'url',
                  mode: 'horizontal',
                  size: 'lg',
                  placeholder: 'http://',
                  required: true,
                },
                {
                  label: '发送条件',
                  type: 'input-text',
                  name: 'sendOn',
                  mode: 'horizontal',
                  size: 'lg',
                  placeholder: '如：this.type == "123"',
                  description: '用表达式来设置该请求的发送条件',
                },
                {
                  label: '数据格式',
                  type: 'button-group-select',
                  name: 'dataType',
                  size: 'sm',
                  mode: 'horizontal',
                  description: `${'发送体格式为'}：<%= data.dataType === "json" ? "application/json" : (data.dataType === "form-data" ? "multipart/form-data" : (data.dataType === "form" ? "application/x-www-form-urlencoded" : "")) %>，${'当发送内容中存在文件时会自动使用 form-data 格式。'}`,
                  options: [
                    {
                      label: 'JSON',
                      value: 'json',
                    },
                    {
                      label: 'FormData',
                      value: 'form-data',
                    },
                    {
                      label: 'Form',
                      value: 'form',
                    },
                  ],
                  disabled: false,
                },
                {
                  type: 'switch',
                  label: '是否设置缓存',
                  name: 'cache',
                  mode: 'horizontal',
                  pipeIn: (value) => !!value,
                  pipeOut: (value) => (value ? 3000 : undefined),
                },
                {
                  label: '',
                  type: 'input-number',
                  name: 'cache',
                  mode: 'horizontal',
                  size: 'md',
                  min: 0,
                  step: 500,
                  visibleOn: 'this.cache',
                  description: '设置该请求缓存有效时间，单位 ms',
                  pipeIn: (value) => (typeof value === 'number' ? value : 0),
                },
                {
                  label: '文件下载',
                  name: 'responseType',
                  type: 'switch',
                  mode: 'horizontal',
                  description: '当接口为二进制文件下载时请勾选，否则会文件乱码。',
                  pipeIn: (value) => value === 'blob',
                  pipeOut: (value) => (value ? 'blob' : undefined),
                },
                {
                  label: '数据替换',
                  name: 'replaceData',
                  type: 'switch',
                  mode: 'horizontal',
                  description: '默认数据为追加方式，开启后完全替换当前数据',
                },
                {
                  label: '',
                  name: 'interval',
                  type: 'input-number',
                  mode: 'horizontal',
                  size: 'md',
                  visibleOn: 'typeof this.interval === "number"',
                  step: 500,
                  description: '定时刷新间隔，单位 ms',
                },
                {
                  label: '静默刷新',
                  name: 'silentPolling',
                  type: 'switch',
                  mode: 'horizontal',
                  visibleOn: '!!data.interval',
                  description: '设置自动定时刷新时是否显示loading',
                },
                {
                  label: tipedLabel(
                    '定时刷新停止',
                    '定时刷新一旦设置会一直刷新，除非给出表达式，条件满足后则停止刷新'
                  ),
                  name: 'stopAutoRefreshWhen',
                  type: 'input-text',
                  mode: 'horizontal',
                  horizontal: {
                    leftFixed: 'md',
                  },
                  size: 'lg',
                  visibleOn: '!!data.interval',
                  placeholder: '停止定时刷新检测表达式',
                },
              ],
            },
            {
              title: 'HTTP配置',
              tab: [
                {
                  type: 'switch',
                  label: tipedLabel('请求头', '可以配置<code>headers</code>对象，添加自定义请求头'),
                  name: 'headers',
                  mode: 'horizontal',
                  className: 'm-b-xs',
                  pipeIn: (value) => !!value,
                  pipeOut: (value) => (value ? { '': '' } : null),
                },
                {
                  type: 'combo',
                  name: 'headers',
                  mode: 'horizontal',
                  syncDefaultValue: false,
                  multiple: true,
                  visibleOn: 'this.headers',
                  items: [
                    {
                      type: 'input-text',
                      name: 'key',
                      placeholder: 'Key',
                      unique: true,
                      required: true,
                      options: [
                        {
                          label: 'Content-Encoding',
                          value: 'Content-Encoding',
                        },
                        {
                          label: 'Content-Type',
                          value: 'Content-Type',
                        },
                      ],
                    },
                    {
                      type: 'input-text',
                      name: 'value',
                      placeholder: 'Value',
                      disabled: false,
                    },
                  ],
                  pipeIn: (value) => {
                    if (!isObject(value)) {
                      return value
                    }

                    let arr = []

                    Object.keys(value).forEach((key) => {
                      arr.push({
                        key: key || '',
                        value:
                          typeof value[key] === 'string' ? value[key] : JSON.stringify(value[key]),
                      })
                    })
                    return arr
                  },
                  pipeOut: (value) => {
                    if (!Array.isArray(value)) {
                      return value
                    }
                    let obj = {}

                    value.forEach((item) => {
                      let key = item.key || ''
                      let value = item.value
                      try {
                        value = JSON.parse(value)
                      } catch (e) {}

                      obj[key] = value
                    })
                    return obj
                  },
                },
                {
                  type: 'switch',
                  label: tipedLabel(
                    '发送数据',
                    '当没开启数据映射时，发送 API 的时候会发送尽可能多的数据，如果你想自己控制发送的数据，或者需要额外的数据处理，请开启此选项'
                  ),
                  name: 'data',
                  mode: 'horizontal',
                  pipeIn: (value) => !!value,
                  pipeOut: (value) => (value ? { '&': '$$' } : null),
                },
                {
                  type: 'combo',
                  syncDefaultValue: false,
                  name: 'data',
                  mode: 'horizontal',
                  renderLabel: false,
                  visibleOn: 'this.data',
                  descriptionClassName: 'help-block text-xs m-b-none',
                  description:
                    '<p>当没开启数据映射时，发送数据自动切成白名单模式，配置啥发送啥，请绑定数据。如：<code>{"a": "\\${a}", "b": 2}</code></p><p>如果希望在默认的基础上定制，请先添加一个 Key 为 `&` Value 为 `\\$$` 作为第一行。</p><div>当值为 <code>__undefined</code>时，表示删除对应的字段，可以结合<code>{"&": "\\$$"}</code>来达到黑名单效果。</div>',
                  multiple: true,
                  pipeIn: (value) => {
                    if (!isObject(value)) {
                      return value
                    }

                    let arr = []

                    Object.keys(value).forEach((key) => {
                      arr.push({
                        key: key || '',
                        value:
                          typeof value[key] === 'string' ? value[key] : JSON.stringify(value[key]),
                      })
                    })
                    return arr
                  },
                  pipeOut: (value) => {
                    if (!Array.isArray(value)) {
                      return value
                    }
                    let obj = {}

                    value.forEach((item) => {
                      let key = item.key || ''
                      let value = item.value
                      try {
                        value = JSON.parse(value)
                      } catch (e) {}

                      obj[key] = value
                    })
                    return obj
                  },
                  items: [
                    {
                      placeholder: 'Key',
                      type: 'input-text',
                      unique: true,
                      name: 'key',
                      required: true,
                    },

                    getSchemaTpl('DataPickerControl', {
                      placeholder: 'Value',
                      name: 'value',
                    }),
                  ],
                },
                getSchemaTpl('apiRequestAdaptor'),
                {
                  type: 'switch',
                  label: tipedLabel(
                    '返回数据',
                    '如果需要对返回结果中的data做额外的数据处理，请开启此选项'
                  ),
                  name: 'responseData',
                  mode: 'horizontal',
                  pipeIn: (value) => !!value,
                  pipeOut: (value) => (value ? { '&': '$$' } : null),
                },
                {
                  type: 'combo',
                  syncDefaultValue: false,
                  name: 'responseData',
                  mode: 'horizontal',
                  renderLabel: false,
                  visibleOn: 'this.responseData',
                  descriptionClassName: 'help-block text-xs m-b-none',
                  multiple: true,
                  pipeIn: (value) => {
                    if (!isObject(value)) {
                      return value
                    }

                    let arr = []

                    Object.keys(value).forEach((key) => {
                      arr.push({
                        key: key || '',
                        value:
                          typeof value[key] === 'string' ? value[key] : JSON.stringify(value[key]),
                      })
                    })
                    return arr
                  },
                  pipeOut: (value) => {
                    if (!Array.isArray(value)) {
                      return value
                    }
                    let obj = {}

                    value.forEach((item) => {
                      let key = item.key || ''
                      let value = item.value
                      try {
                        value = JSON.parse(value)
                      } catch (e) {}

                      obj[key] = value
                    })
                    return obj
                  },
                  items: [
                    {
                      placeholder: 'Key',
                      type: 'input-text',
                      unique: true,
                      name: 'key',
                      required: true,
                    },

                    {
                      placeholder: 'Value',
                      type: 'input-text',
                      name: 'value',
                    },
                  ],
                },
                getSchemaTpl(name === 'validateApi' ? 'validateApiAdaptor' : 'apiAdaptor'),
              ],
            },
            {
              title: '提示信息',
              tab: [
                {
                  label: '默认提示文案',
                  type: 'combo',
                  name: 'messages',
                  mode: 'normal',
                  multiLine: true,
                  items: [
                    {
                      label: '请求成功',
                      type: 'input-text',
                      name: 'success',
                    },

                    {
                      label: '请求失败',
                      type: 'input-text',
                      name: 'failed',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
  }
  render() {
    return (
      <>
        <div>1234</div>
      </>
    )
  }
}

const a = new MyControlProps(React.Component)
a.renderApiConfigTabs()
export default a
@FormItem({
  type: 'ae-apiControls',
  renderLabel: false,
})
export class APIControlRenderer extends MyControlProps {}
