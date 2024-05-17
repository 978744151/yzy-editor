import { BasePlugin, registerEditorPlugin } from 'amis-editor'
import { getCustomSchema } from '@/packages/utils/custom-utils'

export class CustomComponentPlugin extends BasePlugin {
  rendererName = 'custom-component'
  $schema = '/schemas/UnkownSchema.json'
  name = '租户组件模版'
  description = '租户组件模版'
  tags = ['数据容器']
  icon = 'fa fa-star'
  isBaseComponent = false
  pluginIcon = 'icon-table-plugin'
  previewSchema = {
    label: 'custom-component',
  }
  panelTitle = '租户组件模版'
  panelBody = [
    {
      type: 'tabs',
      tabsMode: 'line',
      className: 'm-t-n-xs',
      contentClassName: 'no-border p-l-none p-r-none',
      tabs: [
        {
          title: '常规',
          body: [
            {
              name: 'target',
              label: 'Target',
              type: 'input-text',
            },
          ],
        },
        {
          title: '外观',
          body: [],
        },
      ],
    },
  ]

  get scaffoldForm() {
    return {
      title: '租户组件模版',
      // data: { tenantId: getTid() }, // 这里用data初始化数据无效
      body: [getCustomSchema()],
      pipeOut: (value) => this.formValueToSchema(value),
      canRebuild: false,
    }
  }
  formValueToSchema(value) {
    console.log(value)
    const { designJson } = value
    const schemaJson = { ...JSON.parse(designJson), type: 'container' }
    return schemaJson
  }
}

registerEditorPlugin(CustomComponentPlugin)
