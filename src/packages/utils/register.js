import { MyNestedSelect, MyPicker } from '../widgets'
export function register(amisLib) {
  if (!amisLib) {
    return new Error('amisLib不能为空')
  }
  registerPicker(amisLib)
  registerNestedSelect(amisLib)
}

function registerPicker(amisLib) {
  const { unRegisterRenderer, OptionsControl } = amisLib
  unRegisterRenderer('picker')
  OptionsControl({
    type: 'picker',
    autoLoadOptionsFromSource: false,
    sizeMutable: false,
  })(MyPicker)
}

function registerNestedSelect(amisLib) {
  const { unRegisterRenderer, OptionsControl } = amisLib
  unRegisterRenderer('nested-select')
  unRegisterRenderer('cascader-select')

  class MyNestedSelectRenderer extends MyNestedSelect {}
  class MyCascaderSelectRenderer extends MyNestedSelect {}
  OptionsControl({
    type: 'nested-select',
  })(MyNestedSelectRenderer)

  OptionsControl({
    type: 'cascader-select',
  })(MyCascaderSelectRenderer)
}
