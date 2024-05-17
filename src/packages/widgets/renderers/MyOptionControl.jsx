import OptionControl from 'amis-editor/lib/renderer/OptionControl'
import { getSchemaTpl, tipedLabel, setSchemaTpl } from 'amis-editor'
import { value2array } from 'amis-ui/lib/components/Select'
import { FormItem, Button, render as amisRender } from 'amis'
import cx from 'classnames'
export class MyOptionControl extends OptionControl {
  constructor(...props) {
    super(...props)
    this.handleAdd = this.handleAdd.bind(this)
  }

  static defaultProps = {
    hasApiCenter: true,
  }

  onChange() {
    const { source } = this.state
    const { onBulkChange } = this.props
    const defaultValue = this.normalizeValue()
    const data = {
      source: undefined,
      options: undefined,
      labelField: undefined,
      valueField: undefined,
    }

    if (source === 'custom') {
      const { options } = this.state
      data.options = options.map((item) => ({
        ...(item?.badge ? { badge: item.badge } : {}),
        label: item.label,
        value: item.value,
        ...(item.hiddenOn !== undefined ? { hiddenOn: item.hiddenOn } : {}),
      }))
      data.value = defaultValue
    }

    if (source === 'api' || source === 'variable') {
      const { api, labelField, valueField } = this.state
      data.source = api
      data.labelField = labelField || undefined
      data.valueField = valueField || undefined
    }
    if (source === 'apicenter') {
      const { api } = this.state
      console.log(api)
      const headers = {}
      const query = {}
      if (api) {
        api.headerParams &&
          JSON.parse(api.headerParams).map((el) => {
            headers[el.label] = el.value
          })
        api.queryParams &&
          JSON.parse(api.queryParams).map((el) => {
            query[el.label] = el.value
          })
        const server = {
          url: `/admin/data/api/call`,
          method: 'post',
        }
        if (api.type === 'SERVICE_ARRANGEMENT') {
          data.source = {
            url: server.url,
            method: server.method,
            data: {
              apiId: api.id,
              requestInputParams: { '&': '$$' },
            },
          }
        } else {
          data.source = {
            url: api.url,
            method: api.method,
            responseData: {
              '&': '$$',
              options: api.apiForm.options,
            },
            dataType: api.requestType,
            data: query,
            headers,
            api,
          }
        }
        this.setState({ source: 'api', api: data.source })
      }
    }

    onBulkChange && onBulkChange(data)
    return
  }

  transformOptions(props) {
    const { data: ctx, value: options } = props
    let defaultValue = ctx.value

    const valueArray = value2array(defaultValue, ctx).map(
      (item) => item[ctx?.valueField ?? 'value']
    )

    return Array.isArray(options)
      ? options.map((item) => ({
          label: item.label,
          value: item.value,
          checked: !!~valueArray.indexOf(item[ctx?.valueField ?? 'value']),
          ...(item?.badge ? { badge: item.badge } : {}),
          ...(item.hidden !== undefined ? { hidden: item.hidden } : {}),
          ...(item.hiddenOn !== undefined ? { hiddenOn: item.hiddenOn } : {}),
        }))
      : []
  }

  handleAdd() {
    const { options } = this.state
    options.push({
      label: '',
      value: '',
      checked: false,
    })
    this.setState({ options }, () => {
      this.onChange()
    })
  }
  /** 获取功能性字段控件 schema */
  getFuncFieldSchema() {
    const { labelField, valueField } = this.state

    return [
      {
        label: tipedLabel('显示字段', '选项文本对应的数据字段，多字段合并请通过模板配置'),
        type: 'input-text',
        name: 'labelField',
        clearable: true,
        value: labelField,
        placeholder: '选项文本对应的字段',
        onChange: this.handleLableFieldChange,
      },
      {
        label: '值字段',
        type: 'input-text',
        name: 'valueField',
        clearable: true,
        value: valueField,
        placeholder: '值对应的字段',
        onChange: this.handleValueFieldChange,
      },
    ]
  }
  renderApiCenter() {
    const { render } = this.props
    const { source, api } = this.state
    console.log(this.state)
    return render(
      'apicenter',
      getSchemaTpl('apiCenter', {
        name: 'source',
        mode: 'normal',
        className: 'ae-ExtendMore',
        onChange: this.handleAPIChange,
        value: api,
      })
    )
  }
  renderApiPanel() {
    const { render } = this.props
    const { source, api, labelField, valueField } = this.state
    // console.log(source, api, labelField, valueField);
    const result = render(
      'api',
      getSchemaTpl('apiControl', {
        label: '接口',
        name: 'source',
        mode: 'normal',
        className: 'ae-ExtendMore',
        visibleOn: 'data.autoComplete !== false',
        value: api,
        onChange: this.handleAPIChange,
        sourceType: source,
        footer: [
          {
            label: tipedLabel('显示字段', '选项文本对应的数据字段，多字段合并请通过模板配置'),
            type: 'input-text',
            name: 'labelField',
            value: labelField,
            placeholder: '选项文本对应的字段',
            onChange: this.handleLableFieldChange,
          },
          {
            label: '值字段',
            type: 'input-text',
            name: 'valueField',
            value: valueField,
            placeholder: '值对应的字段',
            onChange: this.handleValueFieldChange,
          },
        ],
      })
    )
    console.log('result', result)
    return result
  }
  render() {
    const { options, source } = this.state
    const { render, className, multiple: multipleProps } = this.props

    return (
      <div className={cx('ae-OptionControl', className)}>
        {this.renderHeader()}

        {/* 自定义选项 */}
        {source === 'custom' ? (
          <div className="ae-OptionControl-wrapper">
            {Array.isArray(options) && options.length ? (
              <ul className="ae-OptionControl-content" ref={this.dragRef}>
                {options.map((option, index) =>
                  this.renderOption({ ...option, index, multipleProps })
                )}
              </ul>
            ) : (
              <div className="ae-OptionControl-placeholder">无选项</div>
            )}
            <div className="ae-OptionControl-footer">
              <Button level="enhance" onClick={this.handleAdd} ref={this.targetRef}>
                添加选项
              </Button>
              {/* {render('option-control-batchAdd', this.buildBatchAddSchema())} */}
              {render('inner', this.buildBatchAddSchema())}
            </div>

            {/* {this.renderPopover()} */}
          </div>
        ) : null}

        {/* API 接口 */}
        {source === 'api' ? this.renderApiPanel() : null}

        {/* API 中心 */}
        {source === 'apicenter' ? this.renderApiCenter() : null}

        {/* 上下文变量 */}
        {source === 'variable'
          ? render('variable', {
              type: 'control',
              label: false,
              className: 'ae-ExtendMore',
              body: [
                getSchemaTpl('sourceBindControl', {
                  label: false,
                  onChange: this.handleAPIChange,
                }),
              ].concat(this.getFuncFieldSchema()),
            })
          : null}
      </div>
    )
  }
}

@FormItem({
  type: 'my-optionControl',
  renderLabel: false,
})
export class MyOptionControlRenderer extends MyOptionControl {}

setSchemaTpl('apiCenter', (patch = {}) => {
  const { name, label, value, description, sampleBuilder, apiDesc, ...rest } = patch

  return {
    type: 'ae-apiCenter',
    label,
    name: name || 'apiCode',
    description,
    ...rest,
  }
})
