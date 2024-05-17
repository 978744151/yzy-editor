import React from 'react'
import cx from 'classnames'
import { FormItem, Icon, Input } from 'amis'
import loginService from '@/services/login'
import { autobind } from 'amis-editor'

export default class APICenter extends React.Component {
  input
  static defaultProps = {
    pickerBtnSchema: {
      type: 'button',
      level: 'link',
      size: 'sm',
    },
    labelField: 'label',
    searchType: 'key',
  }
  constructor(props) {
    super(props)
    this.state = {
      apiForm:
        { options: '{items|pick:label~name,value~id}', groupId: '', apiCode: '' } ||
        props.value?.api?.apiForm,
      sourceDetail: {},
      apiStr: '',
      selectedItem: [],
      schema: props.pickerSchema,
      loading: false,
    }
  }
  componentDidMount() {
    // const { onChange, value } = this.props;
    // if (value) {
    //   onChange(value.api)
    // }
  }
  componentDidUpdate() {}
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
        title: '选择API',
        size: 'md',
        className: 'ae-ApiControl-dialog',
        headerClassName: 'font-bold',
        bodyClassName: 'ae-ApiControl-dialog-body',
        closeOnEsc: true,
        closeOnOutside: false,
        showCloseButton: true,
        data: this.state.apiForm,
        body: this.renderApiConfigTabs(),
      },
    }
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
      })
    )
    console.log('result', result)
    return result
  }
  renderApiConfigTabs(submitOnChange) {
    const { debug = false } = this.props
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
          label: 'API分组',
          type: 'select',
          name: 'groupId',
          placeholder: '请选择API分组',
          inputClassName: 'w-60',
          source: {
            method: 'get',
            url: '/admin/data/api/group/list',
            responseData: {
              options: '${items|pick:label~name,value~id}',
            },
          },
          value: '${groupId}',
          required: true,
          searchable: true,
        },
        {
          label: 'API',
          type: 'select',
          name: 'apiCode',
          placeholder: '请选择API',
          inputClassName: 'w-60',
          required: true,
          source: {
            method: 'get',
            url: '/admin/data/api/page?groupId=${groupId}&size=9999',
            responseData: {
              options: '${records|pick:label~title,value~id }',
            },
          },
          hiddenOn: '!this.groupId',
          searchable: true,
          pipeOut: (value) => {
            return value
          },
        },
        {
          label: 'options',
          type: 'input-text',
          placeholder: 'items 是因为数据直接放在了 data 中，如果是放在其他字段中就换成对应的字段名',
          name: 'options',
          mode: 'horizontal',
          inputClassName: 'w-100',
          value: '{items|pick:label~name,value~id}',
          description: 'items 是因为数据直接放在了 data 中，如果是放在其他字段中就换成对应的字段名',
        },
      ],
    }
  }
  @autobind
  async handleSubmit(values) {
    try {
      const { onChange } = this.props
      const res = await loginService.getApiDetail(values.apiCode)
      this.setState({ apiStr: res.data.data.title })
      onChange({
        ...res.data.data,
        apiForm: {
          options: '$' + values?.options || '${items|pick:label~name,value~id}',
          groupId: values?.groupId,
          apiCode: values?.apiCode,
        },
      })
    } catch {}
  }
  @autobind
  handleSimpleInputChange(e) {
    const value = e.currentTarget.value
    console.log(value)
    this.handleSubmit({ apiCode: value }, 'input')
  }

  @autobind
  inputRef(ref) {
    this.input = ref
  }
  render() {
    const { render } = this.props
    return (
      <div className={cx('ae-ApiControl')}>
        <div className="ae-ApiControl-content" key="content">
          <div className={cx('ae-ApiControl-input')}>
            <Input
              ref={this.inputRef}
              value={this.state.apiStr || ''}
              disabled={true}
              type="text"
              placeholder="请选择Api"
              onChange={this.handleSimpleInputChange}
            />
          </div>
          {render('api-control-dialog', this.renderApiDialog(), {})}
        </div>
      </div>
    )
  }
}
@FormItem({
  type: 'ae-apiCenter',
  renderLabel: false,
})
export class APICenterRenderer extends APICenter {}
