import { registerEditorPlugin } from 'amis-editor'
import { TablePlugin } from 'amis-editor/lib/plugin/Table'

export class MyTablePlugin extends TablePlugin {
  static id = 'TablePlugin'
  static priority = 1000
  name = 'Table'
  isBaseComponent = true
  tags = ['数据容器']

  getRendererInfo(context) {
    const plugin = this
    const { schema, renderer } = context
    // ['crud', 'model-crud'].includes(schema.$$editor?.renderer.name) &&
    if (
      !schema.$$id &&
      ['model-crud', 'crud'].includes(schema.$$editor?.renderer.name) &&
      renderer.name === 'table'
    ) {
      // console.log('plugin', schema, plugin);
      return {
        ...{ id: schema.$$editor.id },
        name: plugin.name,
        regions: plugin.regions,
        patchContainers: plugin.patchContainers,
        vRendererConfig: plugin.vRendererConfig,
        wrapperProps: plugin.wrapperProps,
        wrapperResolve: plugin.wrapperResolve,
        filterProps: plugin.filterProps,
        $schema: plugin.$schema,
        renderRenderer: plugin.renderRenderer,
      }
    }
    return super.getRendererInfo(context)
  }
}

registerEditorPlugin(MyTablePlugin)
