import React from 'react'
import 'amis/sdk/sdk.js'
import 'amis/sdk/sdk.css'
import 'amis/sdk/iconfont.css'
import 'amis/sdk/helper.css'
import 'amis/sdk/rest.js'
import 'amis/sdk/tinymce.js'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all'
import 'amis/lib/themes/default.css'
import 'amis/lib/helper.css'
import 'amis-editor-core/lib/style.css'
import 'amis-ui/lib/themes/antd.css'
import 'amis-ui/lib/themes/cxd.css'
// import NestedSelectControl from "amis/lib/renderers/Form/NestedSelect";
import axios from '@/plugins/axios'
import {
  ModelCrud,
  ModelForm,
  Upload,
  fetcherFactory,
  MyPicker,
  MyNestedSelect,
} from '../../../lib/main.js'

const fetcher = fetcherFactory(axios)

const amis = amisRequire('amis/embed')
const amisLib = amisRequire('amis')
const { unRegisterRenderer, OptionsControl } = amisLib
amisLib.unRegisterRenderer('model-crud')
amisLib.Renderer({
  type: 'model-crud',
})(ModelCrud)
amisLib.Renderer({
  type: 'model-form',
})(ModelForm)
amisLib.Renderer({
  type: 'upload',
})(Upload)

amisLib.unRegisterRenderer('picker')
amisLib.OptionsControl({
  type: 'picker',
  autoLoadOptionsFromSource: false,
  sizeMutable: false,
})(MyPicker)
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

class AmisRenderer extends React.Component {
  state = {
    amisLib: null,
    amisInstance: null,
  }
  componentDidMount() {
    console.log(React.version)
    const { schema } = this.props
    let amisInstance = amis.embed(
      '#preview',
      schema,
      {},
      {
        fetcher,
      }
    )
    this.setState({
      amisInstance,
    })
  }
  componentWillUnmount() {
    this.amisInstance?.unmount()
  }
  render() {
    return <div id="preview"></div>
  }
}

export default AmisRenderer
