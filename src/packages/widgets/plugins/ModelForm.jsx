import { BasePlugin, registerEditorPlugin } from 'amis-editor'
import { type_mapper, detail_type_mapper } from './type-mapper'
import { getDataSourceSchema, getIdMap } from '@/packages/utils/model-util'
import { FORM_MODE, genFormItems, recurseTreatAddItems } from '@/packages/utils/schema-util'
import { guid } from 'amis-core'
import { ApiSchemaManager } from '@/packages/utils/model/ApiSchemaManager'

export class ModelFormPlugin extends BasePlugin {
  rendererName = 'model-form'
  $schema = '/schemas/UnkownSchema.json'
  name = '模型表单'
  description = '基于模型生成表单或详情'
  isBaseComponent = true
  tags = ['数据容器']
  icon = 'fa fa-star'
  pluginIcon = 'icon-table-plugin'
  scaffold = {
    type: 'model-form',
  }
  previewSchema = {
    label: 'model-form',
  }
  order = -890

  formValueToSchema(value) {
    console.log('model-form-value=>', value)
    const { plainData, structData } = window.modelScaffoldFormData
    const {
      datasourceId,
      entity,
      features,
      __addFormItems,
      __editFormItems,
      __detailFormItems,
      addFormUseLayout,
      addFormColLength,
      addFormMode,
      addLabelWidth,
      editFormUseLayout,
      editFormColLength,
      editFormMode,
      editLabelWidth,
      detailUseLayout,
      detailColLength,
      detailFormMode,
      detailLabelWidth,
      isStatic,
      bordered,
      brderColor,
      labelBackGroundColor,
      colLengthField,
      labelfontColor,
      labelWidth,
      contentWidth,
    } = value

    const appId = sessionStorage.getItem('appId')

    const apiSchemaManager = new ApiSchemaManager(value)

    let treatedAddFormItems = null
    let treatedEditFormItems = null
    if (__addFormItems) {
      treatedAddFormItems = recurseTreatAddItems(__addFormItems)
    }
    if (__editFormItems) {
      treatedEditFormItems = recurseTreatAddItems(__editFormItems)
    }

    if (features === 'add') {
      return {
        type: 'form',
        id: 'add_form',
        mode: addFormMode,
        labelWidth: addLabelWidth,
        title: '新增',
        body: genFormItems(
          treatedAddFormItems.filter((item) => item.visible),
          type_mapper,
          FORM_MODE.add,
          {
            useLayout: addFormUseLayout,
            colLength: addFormColLength,
            formMode: addFormMode,
            labelWidth: addLabelWidth,
            datasourceId,
            apiSchemaManager,
          }
        ),
        api: apiSchemaManager.add(),
        resetAfterSubmit: true,
        actions: [
          {
            type: 'reset',
            label: '重置',
          },
          {
            type: 'submit',
            level: 'primary',
            label: '提交',
          },
        ],
      }
    } else if (features === 'edit') {
      const formName = 'form:' + guid()
      // 编辑递归结构
      const result = {
        type: 'form',
        data: {},
        mode: editFormMode,
        labelWidth: editLabelWidth,
        title: '编辑',
        body: genFormItems(
          treatedEditFormItems.filter((item) => item.visible),
          type_mapper,
          FORM_MODE.add,
          {
            useLayout: editFormUseLayout,
            colLength: editFormColLength,
            formMode: editFormMode,
            labelWidth: editLabelWidth,
            datasourceId,
            apiSchemaManager,
          }
        ),
        initApi: apiSchemaManager.findOne4Edit(),
        api: apiSchemaManager.edit(),
        actions: [
          {
            type: 'reset',
            label: '重置',
          },
          {
            type: 'submit',
            level: 'primary',
            label: '提交',
          },
        ],
      }
      if (bordered) {
        result.className = 'bordered'
      }
      if (isStatic) {
        result.name = formName
        result.static = isStatic
        result.data = { isStatic }
        result.actions = [
          {
            label: '编辑',
            visibleOn: '${ isStatic }',
            type: 'button',
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: 'nonstatic',
                    componentName: formName,
                  },
                  {
                    actionType: 'setValue',
                    componentName: formName,
                    args: {
                      value: {
                        isStatic: false,
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            type: 'reset',
            label: '重置',
            visibleOn: '${ !isStatic }',
          },
          {
            type: 'button',
            label: '取消',
            visibleOn: '${ !isStatic }',
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: 'static',
                    componentName: formName,
                  },
                  {
                    actionType: 'setValue',
                    componentName: formName,
                    args: {
                      value: {
                        isStatic: true,
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            type: 'submit',
            level: 'primary',
            label: '保存',
            visibleOn: '${ !isStatic }',
          },
        ]
        result.onEvent = {
          submitSucc: {
            actions: [
              {
                actionType: 'static',
                componentName: formName,
              },
              {
                actionType: 'setValue',
                componentName: formName,
                args: {
                  value: {
                    isStatic: true,
                  },
                },
              },
            ],
          },
        }
      }
      return result
    } else if (features === 'detail') {
      const { idMapper: detailFieldsIdMap, plateItems: vDetailItems } = getIdMap(__detailFormItems)
      // 详情递归结构
      return {
        type: 'form',
        source: {},
        data: {},
        mode: detailFormMode,
        labelWidth: detailLabelWidth,
        title: '详情',
        body: genFormItems(vDetailItems, detail_type_mapper, FORM_MODE.detail, {
          useLayout: detailUseLayout,
          colLength: detailColLength,
          formMode: detailFormMode,
          labelWidth: detailLabelWidth,
          datasourceId,
          apiSchemaManager,
        }),
        initApi: apiSchemaManager.findOne4Detail(),
      }
    } else if (features === 'Eform' || features === 'Pform') {
      const vAddFormItems = treatedAddFormItems.filter((item) => item.visible)
      const addFormBody = genFormItems(
        vAddFormItems,
        type_mapper,
        FORM_MODE.add,
        {
          brderColor,
          labelBackGroundColor,
          labelfontColor,
          colLengthField,
          labelWidth,
          contentWidth,
          datasourceId,
          apiSchemaManager,
        },
        features
      )
      return {
        type: 'form',
        id: 'add_form',
        mode: addFormMode,
        labelWidth: addLabelWidth,
        title: '电子表单',
        body: addFormBody,
        wrapWithPanel: false,
        api: apiSchemaManager.add(),
        initApi: apiSchemaManager.findOne4Edit(),
        resetAfterSubmit: true,
        actions: [
          {
            type: 'reset',
            label: '重置',
          },
          {
            type: 'submit',
            level: 'primary',
            label: '提交',
          },
        ],
      }
    }
  }
  get scaffoldForm() {
    const serviceSchemaId = 'dynamicModelForm'
    return {
      title: '基于模型生成表单或详情',
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
              options: [
                { value: 'add', label: '新增' },
                { value: 'edit', label: '编辑' },
                { value: 'detail', label: '详情' },
                { value: 'Eform', label: '电子表单' },
                { value: 'Pform', label: '属性表单' },
              ],
              value: 'add',
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
        // {
        //   type: "service",
        //   api: {
        //     url: "/admin/data/model/entity/${entity}?usePage=form",
        //     method: "get",
        //   },
        //   visibleOn: "${entity}",
        // },
      ],
      pipeOut: (value) => this.formValueToSchema(value),
    }
  }
}

registerEditorPlugin(ModelFormPlugin)
