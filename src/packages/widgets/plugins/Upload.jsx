import { BasePlugin, registerEditorPlugin } from 'amis-editor'

export class UploadPlugin extends BasePlugin {
  rendererName = 'upload'
  $schema = '/schemas/UnkownSchema.json'
  name = '上传'
  description = '用于批量导入的上传按钮'
  isBaseComponent = true
  tags = ['数据容器']
  icon = 'fa fa-star'
  pluginIcon = 'icon-table-plugin'
  scaffold = {
    type: 'upload',
    label: '导入',
  }
  previewSchema = {
    label: 'upload',
  }
}

registerEditorPlugin(UploadPlugin)
