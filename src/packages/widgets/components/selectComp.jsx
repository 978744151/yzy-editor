import React from 'react'
import { Drawer } from 'amis'
import { observer } from 'mobx-react'

function SelectComp() {
  return (
    <Drawer
      ize="xs"
      className="Doc-navDrawer"
      closeOnOutside
      show={true}
      position="left"
    ></Drawer>
  )
}
export default observer(SelectComp)
