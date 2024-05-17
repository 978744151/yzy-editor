import {
  type_mapper,
  query_type_mapper,
  detail_type_mapper,
} from '../../widgets/plugins/type-mapper'
import { genFormItems, wrapLayout } from '../schema-util'
import { FORM_MODE } from '../schema-util'
import { ArrayCalculator, orderEqual } from '../array-util'
import { ApiSchemaManager } from './ApiSchemaManager'
import { copy } from '../common'
import { getIdMap } from '../model-util'
import { objectEquals } from '../object-util'
import { SchemaRawParser } from './SchemaRawParser'

export class ModelSchemaManager {
  constructor(schema, oldFormValues, changedFormValues) {
    this.schema = schema
    this.oldFormValues = oldFormValues
    this.changedFormValues = changedFormValues
    this.formValues = {
      ...oldFormValues,
      ...changedFormValues,
    }
    this.apiSchemaManager = new ApiSchemaManager(this.formValues)
    const { plainData, structData, tableSet } = window.modelScaffoldFormData
    this.plainData = plainData
    this.structData = structData
    this.tableSet = tableSet
    this.arrayCalculator = new ArrayCalculator()
  }
  featureCfgMapper = {
    __addFormItems: {
      mapper: type_mapper,
      formMode: FORM_MODE.add,
    },
    __editFormItems: {
      mapper: type_mapper,
      formMode: FORM_MODE.add,
    },
    __queryFormItems: {
      mapper: query_type_mapper,
      formMode: FORM_MODE.query,
    },
    __detailFormItems: {
      mapper: detail_type_mapper,
      formMode: FORM_MODE.detail,
    },
    __tableItems: {
      mapper: detail_type_mapper,
      formMode: FORM_MODE.table,
    },
  }
  querySchema() {
    const {
      queryFormMode,
      queryLabelWidth,
      __queryFormItems,
      queryUseLayout,
      queryColLength,
      datasourceId,
    } = this.formValues
    console.log('this.formValues', this.formValues)
    console.log('useLayout', queryUseLayout)
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
          apiSchemaManager: this.apiSchemaManager,
        }
      ),
      actions: [
        {
          type: 'submit',
          level: 'primary',
          label: '查询',
        },
      ],
    }
  }

  addSchema() {
    const {
      addFormUseLayout,
      addFormColLength,
      addFormMode,
      addLabelWidth,
      datasourceId,
      __addFormItems,
      name,
    } = this.formValues

    const form = {
      type: 'form',
      mode: addFormMode,
      labelWidth: addLabelWidth,
      title: '新增',
      data: {},
      body: genFormItems(
        __addFormItems.filter((item) => item.visible),
        type_mapper,
        FORM_MODE.add,
        {
          useLayout: addFormUseLayout,
          colLength: addFormColLength,
          formMode: addFormMode,
          labelWidth: addLabelWidth,
          datasourceId,
          apiSchemaManager: this.apiSchemaManager,
        }
      ),
      api: this.apiSchemaManager.add(),
      resetAfterSubmit: true,
      wrapWithPanel: false,
    }
    return {
      type: 'button',
      label: '新增',
      actionType: 'dialog',
      level: 'primary',
      target: name,
      dialog: {
        data: {},
        size: 'md',
        title: '新增',
        body: form,
      },
    }
  }

  editSchema() {
    const {
      editFormUseLayout,
      editFormColLength,
      editFormMode,
      editLabelWidth,
      datasourceId,
      __editFormItems,
      name,
    } = this.formValues
    return {
      label: '编辑',
      type: 'button',
      level: 'link',
      actionType: 'dialog',
      target: name,
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
            __editFormItems.filter((item) => item.visible),
            type_mapper,
            FORM_MODE.add,
            {
              useLayout: editFormUseLayout,
              colLength: editFormColLength,
              formMode: editFormMode,
              labelWidth: editLabelWidth,
              datasourceId,
              apiSchemaManager: this.apiSchemaManager,
            }
          ),
          initApi: this.apiSchemaManager.findOne4Detail(),
          api: this.apiSchemaManager.edit(),
          wrapWithPanel: false,
        },
      },
    }
  }

  detailSchema() {
    const {
      detailFormMode,
      detailUseLayout,
      detailColLength,
      detailLabelWidth,
      datasourceId,
      __detailFormItems,
    } = this.formValues
    return {
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
                        apiSchemaManager: this.apiSchemaManager,
                      }
                    ),
                    initApi: this.apiSchemaManager.findOne4Detail(),
                    wrapWithPanel: false,
                  },
                ],
              },
            },
          ],
        },
      },
    }
  }

  /**
   * 注意：返回的是一个数组
   * @returns
   */
  importSchema() {
    const { name } = this.formValues
    const { templateApi, api } = this.apiSchemaManager.import()
    return [
      {
        type: 'action',
        actionType: 'ajax',
        api: templateApi,
        label: '下载导入模板',
      },
      {
        label: '上传',
        type: 'upload',
        name: 'file',
        accept: '.xlsx',
        receiver: api,
        onEvent: {
          submitSucc: {
            actions: [
              {
                actionType: 'reload',
                target: name,
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
      },
    ]
  }

  exportSchema() {
    return {
      type: 'action',
      actionType: 'ajax',
      api: this.apiSchemaManager.export(),
      label: '导出',
    }
  }

  removeSchema() {
    return {
      type: 'button',
      label: '删除',
      level: 'link',
      className: 'text-danger',
      confirmText: '确定要删除？',
      actionType: 'ajax',
      api: this.apiSchemaManager.remove(),
    }
  }
  batchRemoveSchema() {
    return {
      label: '批量删除',
      actionType: 'ajax',
      confirmText: '确定要批量删除?',
      api: this.apiSchemaManager.batchRemove(),
    }
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
          const newItem = arr2[i]
          result.push({
            type: diffRes.type,
            index: i,
            item: newItem,
            name: newItem.tableName + '.' + newItem.fieldName,
          })
        }
      }
      return result
    } else {
      // 如果顺序不一样
      console.log('顺序不一样的处理待实现')
    }
  }

  getNewSchema() {
    const { oldFormValues, changedFormValues: newFormValues, formValues, schema } = this
    const newSchema = copy(schema)
    console.log('schema', newSchema)

    // 大项的新增和删除
    let diff = {
      positive: [],
      negative: [],
    }
    const newFeatures = newFormValues.features
    const oldFeatures = oldFormValues.features || ''

    if (newFeatures) {
      // features发生变化
      const newFeaturesArr = newFeatures.split(',')
      const oldFeaturesArr = oldFeatures.split(',')
      console.log({ newFeaturesArr, oldFeaturesArr })
      diff = this.arrayCalculator.difference(newFeaturesArr, oldFeaturesArr)
    }

    console.log('diff-features', diff)

    const oldHas = (feature) =>
      oldFormValues.features ? oldFormValues.features.includes(feature) : false
    const addHas = (feature) => diff.positive.includes(feature)
    const removeHas = (feature) => diff.negative.includes(feature)

    const featureMapper = {
      add: '__addFormItems',
      edit: '__editFormItems',
      query: '__queryFormItems',
      table: '__tableItems',
      detail: '__detailFormItems',
      export: '__exportItems',
      import: '__importItems',
    }

    const fieldMapper = {
      add: {
        useLayout: 'addFormUseLayout',
        colLength: 'addFormColLength',
        formMode: 'addFormMode',
        labelWidth: 'addLabelWidth',
      },
      edit: {
        useLayout: 'editFormUseLayout',
        colLength: 'editFormColLength',
        formMode: 'editFormMode',
        labelWidth: 'editLabelWidth',
      },
      detail: {
        useLayout: 'detailUseLayout',
        colLength: 'detailColLength',
        formMode: 'detailFormMode',
        labelWidth: 'detailLabelWidth',
      },
      query: {
        useLayout: 'queryUseLayout',
        colLength: 'queryColLength',
        formMode: 'queryFormMode',
        labelWidth: 'queryLabelWidth',
      },
    }

    const editListHas = (feature) => {
      return featureMapper[feature] in newFormValues
    }
    const editCfgHas = (feature) => {
      const map = fieldMapper[feature]
      for (const key in map) {
        if (map[key] in newFormValues) {
          return true
        }
      }

      return false
    }

    // 取出operation
    let operation = newSchema.columns.find((item) => item.type === 'operation')

    // 先去除operation
    newSchema.columns = newSchema.columns.filter((item) => item.type !== 'operation')

    const transform = (arr, field) => {
      // const fieldMapper = {
      //   add: {
      //     useLayout: "addFormUseLayout",
      //     colLength: "addFormColLength",
      //     formMode: "addFormMode",
      //     labelWidth: "addLabelWidth",
      //   },
      //   edit: {
      //     useLayout: "editFormUseLayout",
      //     colLength: "editFormColLength",
      //     formMode: "editFormMode",
      //     labelWidth: "editLabelWidth",
      //   },
      //   detail: {
      //     useLayout: "detailUseLayout",
      //     colLength: "detailColLength",
      //     formMode: "detailFormMode",
      //     labelWidth: "detailLabelWidth",
      //   },
      //   query: {
      //     useLayout: "queryUseLayout",
      //     colLength: "queryColLength",
      //     formMode: "queryFormMode",
      //     labelWidth: "queryLabelWidth",
      //   },
      // };
      // console.log("diff-items", arr);
      // let otherCfg = {};
      // if (fieldMapper[field]) {
      //   const { useLayout, colLength, formMode, labelWidth } =
      //     fieldMapper[field];
      //   otherCfg = {
      //     useLayout: formValues[useLayout],
      //     colLength: formValues[colLength],
      //     formMode: formValues[formMode],
      //     labelWidth: formValues[labelWidth],
      //   };
      // }

      return arr.reduce((acc, { name, type, item, index }) => {
        const curMapper = this.featureCfgMapper[field]
        const schemaArray = genFormItems([item], curMapper.mapper, curMapper.formMode, {
          datasourceId: newSchema.data.datasourceId,
          apiSchemaManager: this.apiSchemaManager,
          // ...otherCfg,
        })
        acc[name] = {
          index,
          type,
          schema: schemaArray[0],
        }
        return acc
      }, {})
    }

    const schemaRawParser = new SchemaRawParser(newSchema)
    // table
    if (editListHas('table')) {
      const field = featureMapper['table']
      const oldArr = oldFormValues[field]
      const newArr = newFormValues[field]
      const patchMap = transform(this.findDiffItems(oldArr, newArr), field)
      // const oldMap = toMap(newSchema.columns);
      const oldMap = schemaRawParser.getTableMap()
      console.log({ patchMap, oldMap, newArr, oldArr })
      newSchema.columns = newArr
        .map((item) => {
          const name = item.tableName + '.' + item.fieldName
          const patch = patchMap[name]
          if (patch) {
            const { type, schema } = patch
            if (type === 'remove') {
              return
            } else if (type === 'edit') {
              return schema
            } else if (type === 'add') {
              return schema
            }
          }
          return oldMap[name]
        })
        .filter((item) => item !== undefined)
    }
    /**
     * 针对小项的修改
     */
    const modifyQueryBody = () => {
      if (editCfgHas('query') || editListHas('query')) {
        let patchMap = {}
        const field = featureMapper['query']
        const oldArr = oldFormValues[field]
        const newArr = newFormValues[field]
        const oldMap = schemaRawParser.getQueryMap()
        let standardArr = oldArr
        if (editListHas('query')) {
          standardArr = newArr // 以新的item为标准
          patchMap = transform(this.findDiffItems(oldArr, newArr), field) // 修改部分新生成
        }
        if (!newSchema.filter) {
          newSchema.filter = this.querySchema()
        } else {
          const { queryFormMode, queryLabelWidth, queryUseLayout, queryColLength } = this.formValues
          // console.log({ queryColLength, queryUseLayout });
          const formItems = standardArr
            .map((item) => {
              const name = item.tableName + '.' + item.fieldName
              const patch = patchMap[name]
              if (patch) {
                const { type, schema } = patch
                if (type === 'remove') {
                  return
                } else if (type === 'edit') {
                  return schema
                } else if (type === 'add') {
                  return schema
                }
              }
              return oldMap[name]
            })
            .filter((item) => item !== undefined)
          newSchema.filter = {
            ...newSchema.filter,
            mode: queryFormMode,
            labelWidth: queryLabelWidth,
            body: queryUseLayout ? wrapLayout(formItems, queryColLength) : formItems,
          }
        }
      }
    }

    const modifyActionBody = (actionName, actions) => {
      const actionLabelMapper = {
        add: '新增',
        edit: '编辑',
        detail: '详情',
      }
      if (editCfgHas(actionName) || editListHas(actionName)) {
        let patchMap = {}
        const field = featureMapper[actionName]
        const oldArr = oldFormValues[field]
        const newArr = newFormValues[field]

        const oldMap = schemaRawParser.getMapByType(actionName, actions)
        // console.log("oldMap", oldMap);
        let standardArr = oldArr
        if (editListHas(actionName)) {
          standardArr = newArr
          patchMap = transform(this.findDiffItems(oldArr, newArr), field)
        }
        let action = actions.find((item) => item.label === actionLabelMapper[actionName])
        if (action?.dialog?.body) {
          const dialogBodyisArray = Array.isArray(action.dialog.body)
          const form = dialogBodyisArray ? action.dialog.body[0] : action.dialog.body

          const formItems = standardArr
            .map((item) => {
              const name = item.tableName + '.' + item.fieldName
              const patch = patchMap[name]
              if (patch) {
                const { type, schema } = patch
                if (type === 'remove') {
                  return
                } else if (type === 'edit') {
                  return schema
                } else if (type === 'add') {
                  return schema
                }
              }
              return oldMap[name]
            })
            .filter((item) => item !== undefined)

          const __mapper = fieldMapper[actionName]
          const result = {
            ...form,
            mode: this.formValues[__mapper.formMode],
            labelWidth: this.formValues[__mapper.labelWidth],
            body: this.formValues[__mapper.useLayout]
              ? wrapLayout(formItems, this.formValues[__mapper.colLength])
              : formItems,
          }
          // console.log("result", copy(result));
          if (dialogBodyisArray) {
            action.dialog.body[0] = result
          } else {
            action.dialog.body = result
          }
          return actions
        }
      }
    }

    /**
     * 处理actions
     * query add import export
     */
    const treatHeaderActions = (__actions) => {
      let actions = copy(__actions)
      if (addHas('add')) {
        // add
        actions.push(this.addSchema())
      } else if (removeHas('add')) {
        // remove
        actions = actions.filter((item) => item.label !== '新增')
      } else {
        // edit
        if (editCfgHas('add') || editListHas('add')) {
          actions = modifyActionBody('add', actions)
        }
      }
      if (addHas('import')) {
        actions.push(...this.importSchema())
      } else if (removeHas('import')) {
        actions = actions.filter((item) => !['上传', '下载导入模板'].includes(item.label))
      } else if (editListHas('import')) {
        // 重新生成
        const importButtonsMap = this.importSchema().reduce((acc, item) => {
          acc[item.label] = item
          return acc
        }, {})
        actions = actions.map((item) => {
          return importButtonsMap[item.label] || item
        })
      }
      if (addHas('export')) {
        actions.push(this.exportSchema())
      } else if (removeHas('export')) {
        actions = actions.filter((item) => item.label !== '导出')
      } else if (editListHas('export')) {
        const exportBtn = this.exportSchema()
        actions = actions.map((item) => {
          if (item.label === exportBtn.label) {
            return exportBtn
          }
          return item
        })
      }
      return actions
    }

    // 新增query
    if (addHas('query')) {
      newSchema.filter = this.querySchema()
      newSchema.filter.actions = treatHeaderActions(newSchema.filter.actions)
    }
    // 删除query
    else if (removeHas('query')) {
      if (newSchema.filter) {
        if (newSchema.filter.actions) {
          newSchema.headerToolbar.push(treatHeaderActions(newSchema.filter.actions))
        }
        delete newSchema.filter
      }
    }
    // query不增不减，且原来有query
    else if (oldHas('query')) {
      if (!newSchema.filter) {
        newSchema.filter = this.querySchema()
      }
      newSchema.filter.actions = treatHeaderActions(newSchema.filter.actions)
      // 针对小项修改
      modifyQueryBody()
    }
    // query不增不减，原来没有query
    else {
      newSchema.headerToolbar = treatHeaderActions(newSchema.headerToolbar) // 修改actions
    }

    // batchRemove
    if (addHas('batchRemove')) {
      newSchema.bulkActions.push(this.batchRemoveSchema())
    } else if (removeHas('batchRemove')) {
      newSchema.bulkActions = newSchema.bulkActions.filter((item) => item.label !== '批量删除')
    }

    const treatColButtons = (__buttons) => {
      if (!__buttons) {
        return
      }
      let buttons = copy(__buttons)
      if (addHas('detail')) {
        buttons.push(this.detailSchema())
      } else if (removeHas('detail')) {
        buttons = buttons.filter((item) => item.label !== '详情')
      } else {
        console.log('修改detail')
        if (editCfgHas('detail') || editListHas('detail')) {
          buttons = modifyActionBody('detail', buttons)
        }
      }

      if (addHas('edit')) {
        buttons.push(this.editSchema())
      } else if (removeHas('edit')) {
        buttons = buttons.filter((item) => item.label !== '编辑')
      } else {
        console.log('修改edit')
        if (editCfgHas('edit') || editListHas('edit')) {
          buttons = modifyActionBody('edit', buttons)
        }
      }

      if (addHas('remove')) {
        buttons.push(this.removeSchema())
      } else if (removeHas('remove')) {
        buttons = buttons.filter((item) => item.label === '删除')
      }
      return buttons
    }

    // detail edit remove
    if (operation) {
      if (operation.buttons) {
        operation.buttons = treatColButtons(operation.buttons)
      } else {
        operation.buttons = treatColButtons([])
      }
    } else {
      operation = {
        type: 'operation',
        label: '操作',
        buttons: treatColButtons([]),
      }
    }
    // 最后把operation再放回去
    if (operation.buttons.length > 0) {
      newSchema.columns.push(operation)
    }

    console.log('result=>', newSchema)

    return newSchema
  }
}
