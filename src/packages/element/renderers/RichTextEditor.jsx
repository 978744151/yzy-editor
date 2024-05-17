import React, { Component } from 'react'
import RichTextEditorVue from '../ui/RichTextEditor/index.vue'
import { applyVueInReact } from 'veaury'
import { FormItem, unRegisterRenderer } from 'amis-core'
const ElRichTextEditor = applyVueInReact(RichTextEditorVue)

export default class RichTextEditorControl extends Component {
  render() {
    const { value, onChange, options, ...rest } = this.props
    // console.log('props', rest)
    const props = {
      value,
      onChange,
      options,
    }
    const elProps = {}
    return <ElRichTextEditor {...props} className={{ 'w-full': true }} props={elProps} />
  }
}
unRegisterRenderer('input-rich-text')
@FormItem({
  // type: 'el-rich-text-editor',
  type: 'input-rich-text',
  sizeMutable: false,
})
export class ElRichTextEditorRenderer extends RichTextEditorControl {}
