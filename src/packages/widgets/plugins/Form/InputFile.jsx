import { FileControlPlugin } from 'amis-editor/lib/plugin/Form/InputFile'
import { registerEditorPlugin } from 'amis-editor'

export class MyInputFile extends FileControlPlugin {
  static id = 'MyInputFile'
  static priority = 1000
  order = -900
  panelJustify = true
  isBaseComponent = false
  scaffold = {
    type: 'input-file',
    label: '文件上传',
    autoUpload: true,
    proxy: true,
    uploadType: 'fileReceptor',
    name: 'file',
    receiver: {
      url: '/admin/sys-file/file',
      method: 'post',
    },
  }
}
registerEditorPlugin(MyInputFile)
