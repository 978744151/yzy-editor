import { ImageControlPlugin } from 'amis-editor/lib/plugin/Form/InputImage'
import { registerEditorPlugin } from 'amis-editor'

export class MyImageFile extends ImageControlPlugin {
  static id = 'MyImageFile'
  static priority = 1000
  order = -900
  panelJustify = true
  isBaseComponent = false
  scaffold = {
    type: 'input-image',
    label: '图片上传',
    name: 'image',
    autoUpload: true,
    proxy: true,
    uploadType: 'fileReceptor',
    imageClassName: 'r w-full',
    receiver: {
      url: '/admin/sys-file/file',
      method: 'post',
    },
  }
}
registerEditorPlugin(MyImageFile)
