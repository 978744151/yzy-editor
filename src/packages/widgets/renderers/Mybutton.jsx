import { Renderer } from 'amis'
import React from 'react'

@Renderer({
  name: 'my-button',
  type: 'my-button',
})
export class Mybutton extends React.Component {
  render() {
    const { render, ...rest } = this.props
    return <div>{render('body', { ...rest, type: 'button' })}</div>
  }
}
