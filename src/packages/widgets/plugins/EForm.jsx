import { registerEditorPlugin } from 'amis-editor'
import { ModelFormPlugin } from './ModelForm.jsx'
import { getDataSourceSchema } from '@/packages/utils/model-util'
export class EFormPlugin extends ModelFormPlugin {
  rendererName = 'E-form'
  $schema = '/schemas/UnkownSchema.json'
  name = '电子模型表单'
  description = '基于模型生成电子表单'
  isBaseComponent = false
  tags = ['数据容器']
  icon = 'fa fa-star'
  pluginIcon = 'icon-table-plugin'
  scaffold = {
    type: 'E-form',
  }
  previewSchema = {
    label: 'E-form',
  }
  order = -890
  get scaffoldForm() {
    const serviceSchemaId = 'dynamicModelForm'
    return {
      title: '基于模型生成电子表单',
      body: [
        getDataSourceSchema({
          componentId: serviceSchemaId,
        }),
        { type: 'divider' },
        {
          type: 'group',
          mode: 'inline',
          body: [
            {
              label: '表单类型',
              name: 'features',
              type: 'button-group-select',
              options: [{ value: 'Eform', label: '电子表单' }],
              value: 'Eform',
              visibleOn: '${ entity }',
            },
          ],
        },
        {
          type: 'service',
          id: serviceSchemaId,
          schemaApi: {
            url: '/admin/data/model/entity/${entityId}?usePage=form',
            method: 'get',
            sendOn: '${entityId}',
            responseData: {
              data: '${values}',
              body: '${schema}',
              structData: '${structData}',
              plainData: '${plainData}',
              tableSet: '${tableSet}',
            },
          },
          onEvent: {
            fetchSchemaInited: {
              actions: [
                {
                  actionType: 'custom',
                  script: 'window.modelScaffoldFormData = event.data',
                },
              ],
            },
          },
        },
      ],
      pipeOut: (value) => this.formValueToSchema(value),
    }
  }
}

registerEditorPlugin(EFormPlugin)
