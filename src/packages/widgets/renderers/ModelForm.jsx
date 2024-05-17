import { Renderer } from 'amis'
import React from 'react'

@Renderer({
  name: 'model-form',
  type: 'model-form',
})
export class ModelForm extends React.Component {
  render() {
    const { render, ...rest } = this.props
    return <div>{render('body', { ...rest, type: 'form' })}</div>
  }
}
