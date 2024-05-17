import React, { Component } from 'react'
import RadioVue from '../ui/Radio.vue'
import { applyVueInReact } from 'veaury'
import { FormItem } from 'amis-core'
import { withOptions } from '../hoc/options'
const ElRadio = applyVueInReact(RadioVue)

@withOptions({
  hasSelectAll: true,
})
export default class RadioControl extends Component {
  render() {
    const {
      value,
      options,
      onChange,
      searchable,
      clearable,
      labelField,
      valueField,
      placeholder,
      size,
      styleMode,
    } = this.props
    const props = {
      value,
      onChange,
      filterable: searchable,
      clearable,
      placeholder,
      styleMode,
    }
    const elProps = {
      label: labelField,
      value: valueField,
    }
    return (
      <ElRadio
        {...props}
        className={{ 'w-full': size === 'full' }}
        options={options}
        props={elProps}
      />
    )
  }
}

@FormItem({
  type: 'el-radios',
  sizeMutable: false,
})
export class ElRadioRenderer extends RadioControl {}
