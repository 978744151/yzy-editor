import { Renderer } from 'amis'
import React from 'react'

@Renderer({
  name: 'custom-component',
  type: 'custom-component',
})
export class CustomComponent extends React.Component {
  render() {
    const { render, ...rest } = this.props
    return <div>{render('body', { ...rest, type: 'crud' })}</div>
  }
}
