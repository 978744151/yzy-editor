import { RichTextControlPlugin } from 'amis-editor/lib/plugin/Form/InputRichText'
import { registerEditorPlugin } from 'amis-editor'

export class MyRichTextPlugin extends RichTextControlPlugin {
  static id = 'MyRichTextPlugin'
  static priority = 1000
  isBaseComponent = false
  panelJustify = true
  scaffold = {
    type: 'input-rich-text',
    label: '富文本',
    name: 'rich-text',
    vendor: 'tinymce',
    receiver: {
      url: '/admin/sys-file/file',
      method: 'post',
    },
    options: {
      toolbar:
        'undo redo bold italic lineheight backcolor alignleft aligncenter alignright alignjustify bullist numlist outdent indent help wordcount code fullscreen table emoticons  link image preview underline strikethrough print ',
      menubar: true,
      height: 400,
      plugins:
        'advlist,autolink,link,image,lists,charmap,preview,anchor,pagebreak,searchreplace,wordcount,visualblocks,visualchars,code,fullscreen,insertdatetime,media,nonbreaking,table,emoticons,template,help',
    },
  }
}
registerEditorPlugin(MyRichTextPlugin)
