import { Renderer } from 'amis'
import React from 'react'

@Renderer({
  name: 'model-crud',
  type: 'model-crud',
})
export class ModelCrud extends React.Component {
  render() {
    const { render, ...rest } = this.props
    return <div>{render('body', { ...rest, type: 'crud' })}</div>
  }
}
