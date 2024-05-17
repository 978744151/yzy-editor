import React from 'react'

export default function (NeedWidthDraggableCom) {
  return class WidthDraggableContainer extends React.Component {
    render() {
      return (
        <>
          <NeedWidthDraggableCom {...this.props} />
        </>
      )
    }
  }
}
