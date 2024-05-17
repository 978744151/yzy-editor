import EventControlProps from 'amis-editor/lib/renderer/event-control/index'

import { FormItem } from 'amis'

export class MyEventControlProps extends EventControlProps {
  constructor(...props) {
    super(...props)
  }
}

@FormItem({
  type: 'my-eventControlProps',
  renderLabel: false,
})
export class MyEventControlPropsRenderer extends MyEventControlProps {}
