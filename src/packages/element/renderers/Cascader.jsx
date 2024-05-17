import React, { Component } from 'react'
import CascaderVue from '../ui/Cascader.vue'
import { applyVueInReact } from 'veaury'
import { FormItem } from 'amis-core'
import { withOptions } from '../hoc/options'
const ElCascader = applyVueInReact(CascaderVue)

// export interface ElCascaderSchema {
//   type: 'el-cascader'
// }

// export interface ElCascaderProps extends OptionsControlProps {}

@withOptions()
export default class CascaderControl extends Component {
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
    } = this.props
    const props = {
      value,
      onChange,
      filterable: searchable,
      clearable,
      placeholder,
    }
    const elProps = {
      label: labelField,
      value: valueField,
    }
    return (
      <ElCascader
        {...props}
        className={{ 'w-full': size === 'full' }}
        options={options}
        props={elProps}
      />
    )
  }
}

@FormItem({
  type: 'el-cascader',
  sizeMutable: false,
})
export class ElCascaderRenderer extends CascaderControl {}
