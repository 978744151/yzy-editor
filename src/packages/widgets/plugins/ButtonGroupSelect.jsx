import { ButtonGroupControlPlugin } from 'amis-editor/lib/plugin/Form/ButtonGroupSelect'
import { registerEditorPlugin } from 'amis-editor'

export class MyButtonGroupControlPlugin extends ButtonGroupControlPlugin {
  static id = 'ButtonGroupControlPlugin'
  static priority = 1000

  //   name = "下拉框";
  //   order = -100;

  //   tags = ["表单项"];

  buildEditorPanel(context, panels) {
    if (context.info.plugin instanceof MyButtonGroupControlPlugin) {
      const plugin = this
      const body = this.panelBodyCreator(context)
      //   console.log("schema", body);
      body.tabs[0].body[0].body[1].body[1].type = 'my-optionControl'
      console.log(body)
      panels.push({
        key: 'my-select',
        icon: this.icon,
        pluginIcon: this.pluginIcon,
        title: this.panelTitle,
        render: this.manager.makeSchemaFormRender({
          justify: this.panelJustify,
          panelById: this.manager.store.activeId,
          definitions: plugin.panelDefinitions,
          submitOnChange: plugin.panelSubmitOnChange,
          api: plugin.panelApi,
          body: body,
          controls: plugin.panelControlsCreator
            ? plugin.panelControlsCreator(context)
            : plugin.panelControls,
        }),
        order: -200,
      })
    }
  }
}

registerEditorPlugin(MyButtonGroupControlPlugin)
