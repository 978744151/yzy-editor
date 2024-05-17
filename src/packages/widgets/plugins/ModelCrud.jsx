import { BasePlugin, registerEditorPlugin } from 'amis-editor'
import { autobind, guid } from 'amis-core'

import { type_mapper, detail_type_mapper, query_type_mapper } from './type-mapper'
import {
  FORM_MODE,
  genFormItems,
  mapModelFieldToPostBodyColumn,
  recurseTreatAddItems,
} from '@/packages/utils/schema-util'
import { getDataSourceSchema, getIdMap, loopOnlyVisible } from '@/packages/utils/model-util'
import { ArrayCalculator, orderEqual } from '@/packages/utils/array-util'
import { ModelSchemaManager } from '@/packages/utils/model/SchemaManager'
import { isObjectEmpty, objectEquals } from '@/packages/utils/object-util'
import { ApiSchemaManager } from '@/packages/utils/model/ApiSchemaManager'

export class ModelCrudPlugin extends BasePlugin {
  rendererName = 'model-crud'
  $schema = '/schemas/UnkownSchema.json'
  name = '模型CRUD'
  description = '基于模型快速生成CRUD'
  isBaseComponent = true
  tags = ['数据容器']
  icon = 'fa fa-star'
  pluginIcon = 'icon-table-plugin'
  scaffold = {
    type: 'model-crud',
  }
  previewSchema = {
    label: 'model-crud',
  }
  order = -900

  _formValue = {}

  get formValue() {
    return this._formValue
  }

  set formValue(value) {
    this._formValue = value
    sessionStorage.setItem('scaffoldFormValues', JSON.stringify(value))
  }

  get isTenant() {
    return window.location.href.includes('/tenant/')
  }
  get formApiUrl() {
    if (this.isTenant) {
      return '/admin/tenant/app/page/config'
    }
    return '/admin/app/page/config'
  }

  /**
   * 持久化表单数据
   * @param {string} id
   * @param {Object} value
   */
  @autobind
  saveFormValues(id, value) {
    this.manager.env.fetcher({
      url: this.formApiUrl,
      method: 'put',
      data: {
        pageId: sessionStorage.getItem('pageId'),
        componentId: id,
        configJson: JSON.stringify(value),
      },
    })
  }

  /**
   * 获取持久化表单数据
   * @param {*} id 组件的id（实际是name）
   * @returns
   */
  @autobind
  async getFormValues(id) {
    const pageId = sessionStorage.getItem('pageId')
    const res = await this.manager.env.fetcher({
      url: this.formApiUrl + `?pageId=${pageId}&componentId=${id}`,
      method: 'get',
    })
    if (res?.data?.configJson) {
      try {
        this.formValue = JSON.parse(res.data.configJson)
      } catch (e) {
        console.warn(e)
      }
    }
    return this.formValue
  }

  // featureMapper = {
  //   __addFormItems: {
  //     mapper: type_mapper,
  //     formMode: FORM_MODE.add,
  //   },
  //   __editFormItems: {
  //     mapper: type_mapper,
  //     formMode: FORM_MODE.add,
  //   },
  //   __queryFormItems: {
  //     mapper: query_type_mapper,
  //     formMode: FORM_MODE.query,
  //   },
  //   __detailFormItems: {
  //     mapper: detail_type_mapper,
  //     formMode: FORM_MODE.detail,
  //   },
  //   __tableItems: {
  //     mapper: detail_type_mapper,
  //     formMode: FORM_MODE.table,
  //   },
  // };

  formValueToSchema = (value) => {
    console.log('pipeOut=>', value, window.modelScaffoldFormData)
    const valueStr = JSON.stringify(value)
    this.formValue = JSON.parse(valueStr)
    console.log('init-save:formValue', JSON.parse(valueStr))
    const appId = sessionStorage.getItem('appId')
    const { plainData, structData, tableSet } = window.modelScaffoldFormData
    const {
      datasourceId,
      entity,
      features,
      name: crudName,
      __addFormItems,
      __editFormItems,
      __tableItems,
      __detailFormItems,
      __queryFormItems,
      __exportItems,
      __importItems,
      queryUseLayout,
      queryColLength,
      queryFormMode,
      queryLabelWidth,
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
    } = value
    this.saveFormValues(crudName, value)

    // 处理__addFormItems,__editFormItems
    let treatedAddFormItems = null
    let treatedEditFormItems = null
    if (__addFormItems) {
      treatedAddFormItems = recurseTreatAddItems(__addFormItems)
    }
    if (__editFormItems) {
      treatedEditFormItems = recurseTreatAddItems(__editFormItems)
    }

    const featureList = features ? features.split(',') : []

    const __features = {
      add: featureList.includes('add'),
      remove: featureList.includes('remove'),
      edit: featureList.includes('edit'),
      query: featureList.includes('query'),
      export: featureList.includes('export'),
      import: featureList.includes('import'),
      batchRemove: featureList.includes('batchRemove'),
    }

    const apiSchemaManager = new ApiSchemaManager(value)
    // Table
    const { idMapper: tableFieldsIdMap, plateItems: vTableColumns } = getIdMap(__tableItems)
    const tableSchema = genFormItems(vTableColumns, detail_type_mapper, FORM_MODE.table, {
      datasourceId,
      apiSchemaManager,
    })

    // 新增表单
    let addFormSchema = ''
    if (__features.add) {
      addFormSchema = {
        type: 'form',
        mode: addFormMode,
        labelWidth: addLabelWidth,
        title: '新增',
        data: {},
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
        wrapWithPanel: false,
      }
    }

    const createFilter = (hasAdd) => {
      const actions = [{ type: 'reset', label: '重置' }]
      if (hasAdd) {
        actions.push({
          type: 'button',
          label: '新增',
          actionType: 'dialog',
          target: crudName,
          dialog: {
            data: {},
            size: 'md',
            title: '新增',
            body: addFormSchema,
          },
        })
      }
      // 导出
      if (__features.export) {
        actions.push({
          type: 'action',
          actionType: 'ajax',
          api: {
            method: 'post',
            url: '/admin/entity/data/export',
            data: {
              entityId: structData.entityId,
              tableName: structData.tableName,
              columns: __exportItems
                // 用户选择的字段，并且是非关联字段
                .filter((item) => item.visible && !(item.extraCfg && item.extraCfg.relType))
                .map(mapModelFieldToPostBodyColumn),
              children: loopOnlyVisible(structData.children, getIdMap(__exportItems).idMapper),
              tableSet,
              formParams: {
                '&': '$$',
              },
            },
            responseType: 'blob',
          },
          label: '导出',
        })
      }
      // 导入
      if (__features.import) {
        const importFieldsIdMap = getIdMap(__importItems).idMapper
        const nestedShape = {
          entityId: structData.entityId,
          tableName: structData.tableName,
          columns: __importItems
            // 用户选择的字段，并且是非关联字段
            .filter((item) => item.visible && !(item.extraCfg && item.extraCfg.relType))
            .map(mapModelFieldToPostBodyColumn),
          children: loopOnlyVisible(structData.children, importFieldsIdMap),
        }
        console.log('nestedShape', nestedShape)
        actions.push({
          type: 'action',
          actionType: 'ajax',
          api: {
            method: 'post',
            url: '/admin/entity/data/import/template',
            data: nestedShape,
            responseType: 'blob',
          },
          label: '下载导入模板',
        })
        actions.push({
          label: '上传',
          type: 'upload',
          name: 'file',
          accept: '.xlsx',
          receiver: {
            url: '/admin/entity/data/import',
            method: 'post',
            data: {
              queryEntityDataJson: JSON.stringify(nestedShape),
            },
          },
          onEvent: {
            submitSucc: {
              actions: [
                {
                  actionType: 'reload',
                  target: crudName,
                },
                {
                  actionType: 'toast',
                  toast: {
                    items: [{ body: '批量导入成功', level: 'success' }],
                  },
                },
              ],
            },
          },
        })
      }

      actions.push({
        type: 'submit',
        level: 'primary',
        label: '查询',
      })
      return {
        title: '',
        mode: queryFormMode,
        labelWidth: queryLabelWidth,
        body: genFormItems(
          getIdMap(__queryFormItems).plateItems,
          query_type_mapper,
          FORM_MODE.query,
          {
            useLayout: queryUseLayout,
            colLength: queryColLength,
            formMode: queryFormMode,
            labelWidth: queryLabelWidth,
            datasourceId,
            apiSchemaManager,
          }
        ),
        actions,
      }
    }

    const headerToolbar = ['bulkActions']
    const bulkActions = []
    if (__features.batchRemove) {
      bulkActions.push({
        label: '批量删除',
        actionType: 'ajax',
        confirmText: '确定要批量删除?',
        api: apiSchemaManager.batchRemove(),
      })
    }
    let filter = undefined
    // 查询表单
    if (__features.add) {
      if (__features.query) {
        // 有新增和查询表单
        filter = createFilter(true)
      } else {
        // 只有新增，无查询表单
        headerToolbar.push.apply(headerToolbar, [
          {
            type: 'button',
            label: '新增',
            size: 'sm',
            align: 'left',
            level: 'primary',
            target: crudName,
            actionType: 'dialog',
            dialog: {
              data: {},
              size: 'md',
              title: '新增',
              body: addFormSchema,
            },
          },
          {
            type: 'columns-toggler',
            align: 'right',
          },
        ])
      }
    }
    // 没有新增，但有查询表单
    else if (__features.query) {
      filter = createFilter(false)
    }

    const hasOperationCol = ['edit', 'detail', 'remove'].some((text) => featureList.includes(text))

    // 操作
    if (hasOperationCol) {
      const buttons = []
      if (featureList.includes('detail')) {
        // 详情递归结构
        buttons.push({
          type: 'button',
          label: '详情',
          level: 'link',
          onEvent: {
            click: {
              actions: [
                {
                  actionType: 'dialog',
                  dialog: {
                    size: 'md',
                    title: '详情',
                    actions: [
                      {
                        type: 'button',
                        actionType: 'confirm',
                        label: '关闭',
                        primary: true,
                      },
                    ],
                    body: [
                      {
                        type: 'form',
                        source: {},
                        data: {},
                        mode: detailFormMode,
                        labelWidth: detailLabelWidth,
                        title: '详情',
                        body: genFormItems(
                          __detailFormItems.filter((item) => item.visible),
                          detail_type_mapper,
                          FORM_MODE.detail,
                          {
                            useLayout: detailUseLayout,
                            colLength: detailColLength,
                            formMode: detailFormMode,
                            labelWidth: detailLabelWidth,
                            datasourceId,
                            apiSchemaManager,
                          }
                        ),
                        initApi: apiSchemaManager.findOne4Detail(),
                        wrapWithPanel: false,
                      },
                    ],
                  },
                },
              ],
            },
          },
        })
      }
      if (featureList.includes('edit')) {
        buttons.push({
          label: '编辑',
          type: 'button',
          level: 'link',
          actionType: 'dialog',
          target: crudName,
          dialog: {
            size: 'md',
            title: '编辑',
            body: {
              type: 'form',
              data: {},
              mode: editFormMode,
              labelWidth: editLabelWidth,
              title: '',
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
              wrapWithPanel: false,
            },
          },
        })
      }
      if (featureList.includes('remove')) {
        buttons.push({
          type: 'button',
          label: '删除',
          level: 'link',
          className: 'text-danger',
          confirmText: '确定要删除？',
          actionType: 'ajax',
          api: apiSchemaManager.remove(),
        })
      }
      tableSchema.push({
        type: 'operation',
        label: '操作',
        buttons,
      })
    }

    // crud-schema
    return {
      type: 'model-crud',
      mode: 'table',
      name: crudName,
      data: {
        datasourceId,
        entityId: entity,
      },
      affixHeader: false,
      api: apiSchemaManager.findList(),
      quickSaveItemApi: apiSchemaManager.edit(),
      filter,
      columns: tableSchema,
      headerToolbar,
      bulkActions,
    }
  }

  genScaffoldForm = ({ formType } = {}) => {
    const isEditForm = formType === 'edit'
    const serviceSchemaId = 'dynamicForm'

    return {
      title: '基于数据模型生成CRUD',
      // data: { features: "add,edit" }, // 这里用data初始化数据无效
      body: [
        getDataSourceSchema({
          componentId: serviceSchemaId,
          formType,
        }),
        {
          name: 'name',
          type: 'hidden',
          label: 'name',
          value: 'name_' + guid(),
        },
        {
          type: 'group',
          mode: 'inline',
          body: [
            {
              name: 'features',
              label: '功能',
              type: 'checkboxes',
              options: [
                { label: '条件查询', value: 'query' },
                { label: '新增', value: 'add' },
                { label: '编辑', value: 'edit' },
                { label: '详情', value: 'detail' },
                { label: '删除', value: 'remove' },
                { label: '批量删除', value: 'batchRemove' },
                { label: '批量编辑', value: 'batchEdit' },
                { label: '导入', value: 'import' },
                { label: '导出', value: 'export' },
              ],
              visibleOn: '${entity}',
            },
          ],
        },
        {
          type: 'service',
          id: serviceSchemaId,
          schemaApi: {
            url: '/admin/data/model/entity/${entityId}?usePage=crud',
            method: 'get',
            sendOn: '${entityId}',
            responseData: {
              ...(isEditForm ? {} : { data: '${values}' }), // 首次初始化，使用values作为data
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
      canRebuild: true,
    }
  }

  get scaffoldForm() {
    return this.genScaffoldForm()
  }

  /**
   * 生成编辑表单schema
   * @param {*} id
   * @returns
   */
  updateForm(id) {
    return {
      ...this.genScaffoldForm({ formType: 'edit' }),
      pipeIn: async (value) => {
        if (Object.keys(value).length > 0) {
          return {
            ...value,
            entityId: value.entity,
          }
        }
        const data = await this.getFormValues(id)
        if (data) {
          return {
            ...data,
            entityId: data.entity,
          }
        }
      },
    }
  }

  multifactor = true

  panelTitle = '模型CRUD'

  get pageId() {
    return sessionStorage.getItem('pageId')
  }
  openScaffoldForm = async (props) => {
    console.log(props)
    const schema = await this.manager.scaffold(this.updateForm(props.data.name), this.formValue)
    this.manager.replaceChild(props.node.id, schema)
    setTimeout(() => {
      this.manager.buildPanels()
    }, 20)
  }

  afterDelete = (event) => {
    this.manager.env.fetcher({
      url: this.formApiUrl,
      method: 'delete',
      data: {
        pageId: sessionStorage.getItem('pageId'),
        componentId: event.context.schema.id,
      },
    })
  }

  fetchParitalModelForm = async (entityId) => {
    const res = await this.manager.env.fetcher({
      url: '/admin/data/model/entity/' + entityId,
      query: { usePage: 'crud', type: 'panelBody' },
      method: 'get',
    })
    return res?.data
  }

  /**
   * 比较两个配置数组，返回操作列表
   * @param {*} arr1
   * @param {*} arr2
   * @returns
   */
  findDiffItems = (arr1, arr2) => {
    const itemEqual = (obj1, obj2) => {
      // 隐藏
      if (obj1.visible && !obj2.visible) {
        return { type: 'remove' }
      }
      // 没有显示和隐藏操作，比较配置是否修改
      else if (obj1.visible && obj2.visible) {
        const c1 = obj1.extraCfg
        const c2 = obj2.extraCfg
        if (c1 && c2) {
          if (!objectEquals(c1, c2)) {
            return { type: 'edit' }
          }
        }
      }
      // 显示，新增一个配置
      else if (!obj1.visible && obj2.visible) {
        return { type: 'add' }
      }
    }

    if (orderEqual(arr1, arr2)) {
      // 如果顺序一样，找到不一样的位置，替换目标
      const result = []
      for (let i = 0; i < arr1.length; i++) {
        const diffRes = itemEqual(arr1[i], arr2[i])
        if (diffRes) {
          result.push({
            type: diffRes.type,
            index: i,
            item: arr2[i],
          })
        }
      }
      return result
    } else {
      // 如果顺序不一样
      console.log('顺序不一样的处理待实现')
    }
  }

  // 缓存状态
  tempFormValue = {}

  panelBodyFormInstance = null

  handlePanelBodyFormChange = (value, oldValue, model, form) => {
    if (!this.panelBodyFormInstance) {
      this.panelBodyFormInstance = form
    }
    // 缓存状态
    const name = model.name
    this.tempFormValue[name] = value
  }

  arrayCalculator = new ArrayCalculator()

  handlePanelBodyFormSubmit = (props) => {
    console.log('props', props)
    const oldFormValue = this.formValue
    const newFormValue = this.tempFormValue
    const form = this.panelBodyFormInstance
    const schema = form.data
    console.log('submit=>', { oldFormValue, newFormValue })

    this.tempFormValue = {} // 清空
    // 待持久化
    this.formValue = {
      ...oldFormValue,
      ...newFormValue,
    }
    const schemaManager = new ModelSchemaManager(schema, oldFormValue, newFormValue)
    const newSchema = schemaManager.getNewSchema()
    // console.log(newSchema);
    // console.log(form);
    this.manager.replaceChild(props.node.id, newSchema)
    setTimeout(() => {
      this.manager.buildPanels()
    }, 20)
    this.saveFormValues(newSchema.name, this.formValue)
  }

  panelBodyAsyncCreator = async (context) => {
    try {
      const { schema } = context
      const { entityId } = schema.data
      let formValues = null
      // 先取本地数据
      if (this.formValue && !isObjectEmpty(this.formValue)) {
        formValues = this.formValue
      } else {
        formValues = await this.getFormValues(schema.name)
      }
      const formSchema = await this.fetchParitalModelForm(entityId)
      window.modelScaffoldFormData = formSchema
      const defaultValues = formValues || formSchema.values
      formSchema.schema.body = formSchema.schema.body.map((collapse) => {
        return {
          ...collapse,
          body: collapse.body.map((ele) => {
            return {
              ...ele,
              onChange: ele.onChange && ele.onChange.bind(this),
            }
          }),
        }
      })

      return [
        {
          type: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          items: [
            {
              type: 'tpl',
              tpl: '模型CRUD',
            },
            {
              type: 'button',
              label: '修改',
              level: 'enhance',
              size: 'sm',
              onClick: 'props.node.info.plugin.openScaffoldForm(props)',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'group',
          mode: 'inline',
          body: [
            {
              name: 'features',
              label: '功能',
              type: 'checkboxes',
              value: formValues.features,
              options: [
                { label: '条件查询', value: 'query' },
                { label: '新增', value: 'add' },
                { label: '编辑', value: 'edit' },
                { label: '查看详情', value: 'detail' },
                { label: '删除', value: 'remove' },
                { label: '批量删除', value: 'batchRemove' },
                { label: '导入', value: 'import' },
                { label: '导出', value: 'export' },
              ],
              onChange: (value, oldValue, model, form) => {
                this.handlePanelBodyFormChange(value, oldValue, model, form)
              },
            },
            {
              type: 'service',
              data: defaultValues,
              body: [formSchema.schema],
            },
          ],
        },
        {
          type: 'button',
          label: '保存',
          level: 'primary',
          className: 'w-full',
          onClick: 'props.node.info.plugin.handlePanelBodyFormSubmit(props)',
        },
      ]
    } catch (e) {
      return [
        {
          type: 'tpl',
          tpl: '表单数据获取失败，原因是登录过期或表单数据存储失败',
        },
      ]
    }
  }
}

registerEditorPlugin(ModelCrudPlugin)
