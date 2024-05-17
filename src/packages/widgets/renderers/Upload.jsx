import { Renderer } from 'amis'
import React from 'react'
import { Button } from 'amis-ui'
import { ScopedContext, autobind } from 'amis-core'
import { normalizeApi } from 'amis-core'

@Renderer({
  type: 'upload',
})
export class Upload extends React.Component {
  static contextType = ScopedContext
  constructor(props, context) {
    super(props)
    const scoped = context
    scoped.registerComponent(this)
    this.uploadRef = React.createRef()
  }

  @autobind
  async handleChange(e) {
    console.log('event', this.props)
    const file = e.target.files[0]
    e.target.value = ''
    const { receiver, env, onAction } = this.props
    if (receiver) {
      const { data, ...rest } = receiver
      const api = normalizeApi(rest)

      await env.fetcher(api, {
        file: file,
        ...data,
      })
      const { onEvent } = this.props
      if (onEvent?.submitSucc?.actions) {
        // const scoped = this.context;
        onEvent?.submitSucc?.actions.forEach((action) => {
          // if (action.actionType === "reload") {
          //   scoped.reload(action.target || action.componentId);
          // }
          onAction(action.actionType, action)
        })
      }
    }
  }

  render() {
    const { accept, label = '导入' } = this.props

    return (
      <Button onClick={() => this.uploadRef.current.click()}>
        {label}
        <input
          ref={this.uploadRef}
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          onChange={this.handleChange}
        />
      </Button>
    )
  }
}
