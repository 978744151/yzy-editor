import cx from 'classnames'
import { OptionsControl, filter, unRegisterRenderer, getVariable } from 'amis-core'
import { Html } from 'amis-ui'
import PickerControl from 'amis/lib/renderers/Form/Picker'
unRegisterRenderer('picker')

export class MyPicker extends PickerControl {
  renderTag(item, index) {
    const { classPrefix: ns, labelField, labelTpl, translate: __, disabled, env, data } = this.props
    return (
      <div
        key={index}
        className={cx(`${ns}Picker-value`, {
          'is-disabled': disabled,
        })}
      >
        <span
          className={`${ns}Picker-valueIcon`}
          onClick={(e) => {
            e.stopPropagation()
            this.removeItem(index)
          }}
        >
          ×
        </span>
        <span
          className={`${ns}Picker-valueLabel`}
          onClick={(e) => {
            e.stopPropagation()
            this.handleItemClick(item)
          }}
        >
          {labelTpl ? (
            <Html html={filter(labelTpl, { ...data, ...item })} filterHtml={env.filterHtml} />
          ) : (
            `${getVariable(item, labelField || 'label') || getVariable(item, 'id')}`
          )}
        </span>
      </div>
    )
  }
}

@OptionsControl({
  type: 'picker',
  autoLoadOptionsFromSource: false,
  sizeMutable: false,
})
export class MyPickerRenderer extends MyPicker {}
