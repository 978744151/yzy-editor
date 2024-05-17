import {
  type_mapper,
  detail_type_mapper,
  query_type_mapper,
  static_form_mapper,
} from '@/packages/widgets/plugins/type-mapper'
import { chunk } from 'lodash-es'
import { filter__retainVisible } from './model-util'
import { copy } from './common'
import { guid } from 'amis-core'
const separator = '.'
/**
 * 枚举
 */
export const FORM_MODE = {
  query: '1',
  table: '2',
  add: '3',
  edit: '4',
  detail: '5',
}

/**
 * 加layout
 * @param {*} formItems
 * @param {*} length
 */
export const wrapLayout = (formItems, length) => {
  length = +length
  const span = 12 / length
  return {
    type: 'grid',
    columns: formItems.map((item) => {
      const _item = { ...item }
      if (item.type === 'combo') {
        _item.className = 'my-combo'
      }
      return {
        md: item.type === 'combo' ? 12 : span,
        // columnClassName: "mb-1",
        body: _item,
      }
    }),
  }
}

/**
 * 生成选项schema
 */
export const genOptions = (item, cfg) => {
  const { datasourceId } = cfg
  const formType = item.extraCfg?.formType || item.formType
  // 针对有选项的组件处理
  if (['select', 'radios', 'checkboxes', 'button-group-select'].includes(formType)) {
    if (item.optionsType === '1') {
      // 枚举
      try {
        const json = JSON.parse(item.optionsValue)
        return {
          options: Array.isArray(json) ? json.map(({ value, label }) => ({ value, label })) : [],
        }
      } catch (e) {
        return {
          options: [],
        }
      }
    } else if (item.optionsType === '2') {
      // 字典
      return {
        source: {
          method: 'get',
          url:
            '/admin/data/dict/value/list?datasourceId=' +
            datasourceId +
            '&typeCode=' +
            item.optionsValue,
          // responseData: {
          //   options: "${items|pick:label~label,value~value}",
          // },
        },
      }
    } else if (item.optionsType === '3') {
      // 区域字典
      return {
        source: {
          method: 'get',
          url: '/admin/data/area/list?datasourceId=' + datasourceId + '&type=' + item.optionsValue,
          responseData: {
            options: '${items|pick:label~name,value~code}',
          },
        },
      }
    }
  }
  return {}
}

/**
 * 选出白名单中字段
 * @param {Array} array
 * @param {String} whiteList
 * @returns
 */
const pick = (array, whiteList) => {
  return array.filter((item) => whiteList.split(',').includes(item.fieldName))
}
/**
 * 生成Form的body配置
 * @param {Array<object>} items 表单配置
 * @param {object} mapper 哪种mapper，取值于type-mapper.js
 * @param {string} mode 模式
 * @param {object} options 额外配置参数
 * @returns
 */
export const genFormItems = (items, mapper, mode, options = {}, type = '') => {
  const { useLayout, colLength, formMode, labelWidth, datasourceId } = options
  /**
   * @type {import('./model/ApiSchemaManager.js').ApiSchemaManager}
   */
  const apiSchemaManager = options.apiSchemaManager
  // console.log(options);
  const result = items
    .filter((item) => item.visible)
    .map((item) => {
      const formType = item.extraCfg?.formType || item.formType
      // 特殊处理：picker的展示模式__table，用子表单展示字段
      // debugger;
      if (formType === '__table' && mode === FORM_MODE.detail) {
        // 详情模式
        return {
          type: 'combo',
          label: item.showName,
          name: item.fieldName,
          noBorder: true,
          subFormMode: formMode,
          labelWidth: labelWidth,
          mode: 'normal',
          multiLine: true,
          items: genFormItems(
            item.extraCfg.subFields.filter((item) => item.visible),
            detail_type_mapper,
            FORM_MODE.detail,
            { ...options, labelWidth }
          ),
        }
      }
      // 特殊处理--列表选择器
      if (formType === 'picker') {
        console.log('picker=>', item)
        const isJoinUnderline = item.extraCfg.joinMode === 'underline'
        const { tableName, fieldName, showName, toTableName, toEntityId } = item
        const {
          valueField,
          dialogSize = 'md',
          labelField,
          queryFields,
          subFields,
          targetLabelField,
        } = item.extraCfg
        const pickerSchema = {
          mode: 'table',
          columns: genFormItems(
            subFields.filter((item) => item.visible),
            detail_type_mapper,
            FORM_MODE.table,
            {
              datasourceId, // 这个不需要布局的
              apiSchemaManager,
              separator: '_',
            }
          ),
        }

        const queryForm = {
          title: '',
          mode: 'normal',
          body: genFormItems(
            subFields.filter((field) => queryFields.includes(field.fieldName)),
            query_type_mapper,
            FORM_MODE.query,
            options
          ),
        }
        if (queryForm.body && queryForm.body.length > 0) {
          pickerSchema.filter = queryForm
        }
        const name = tableName + separator + fieldName

        const mainLabelField = targetLabelField && tableName + separator + targetLabelField

        const _valueField = isJoinUnderline
          ? toTableName + '_' + valueField
          : toTableName + '.' + valueField

        const _labelField = isJoinUnderline
          ? toTableName + '_' + labelField
          : toTableName + '.' + labelField

        const pickerResult = {
          type: 'picker',
          name,
          label: showName,
          size: dialogSize,
          valueField: _valueField,
          labelField: _labelField,
          source: apiSchemaManager.findList2(
            toEntityId,
            item.extraCfg.subFields,
            { data: { _dataType: isJoinUnderline ? 'plain2' : 'plain' } } // plain表示 a.b 不转 a:{b}
          ),
          pickerSchema,
        }
        if (isJoinUnderline) {
          pickerResult.autoFill = {
            [name]: '${valueField}'.replace(/valueField/, _valueField),
          }
          if (mainLabelField) {
            pickerResult.autoFill[mainLabelField] = '${labelField}'.replace(
              /labelField/,
              _labelField
            )
            delete pickerResult.labelField
            pickerResult.labelTpl = '${labelField || mainLabelField}'
              .replace(/labelField/, _labelField)
              .replace(/mainLabelField/, mainLabelField)
          }
        }

        return pickerResult
      }
      // 特殊处理--子表单
      if (formType === 'input-sub-form') {
        console.log('input-sub-form=>', item)
        const body = genFormItems(
          item.extraCfg.subFields.filter((ele) => ele.visible),
          type_mapper,
          FORM_MODE.add,
          options
        )
        if (item.extraCfg.type === 'combo') {
          return {
            type: 'combo',
            label: item.showName,
            name: item.fieldName,
            noBorder: true,
            subFormMode: formMode,
            labelWidth: labelWidth,
            mode: 'normal',
            multiLine: true,
            items: body,
          }
        }
        return {
          type: 'input-sub-form',
          label: item.showName,
          name: item.fieldName,
          btnLabel: '填写',
          form: {
            title: '新增-' + item.showName,
            mode: formMode,
            labelWidth: labelWidth,
            body,
          },
        }
      }
      if (formType === 'input-table') {
        console.log('input-table', item)
        const { showName, fieldName, extraCfg } = item
        const { inputTableMode, subFields, tableFields, selfUpdate } = extraCfg
        const vSubFields = subFields.filter(filter__retainVisible)

        if (mode === FORM_MODE.detail) {
          return {
            type: 'table',
            source: '${' + item.fieldName + '}',
            label: item.showName,
            name: item.fieldName,
            columns: genFormItems(
              item.extraCfg.subFields.filter((ele) => ele.visible),
              detail_type_mapper,
              FORM_MODE.table,
              { datasourceId, apiSchemaManager }
            ),
          }
        }
        let inputTableSchema = null
        if (inputTableMode === 'form') {
          // 表单模式
          const createInputTable = (selfUpdate, serviceName) => {
            const addFormItems = genFormItems(vSubFields, type_mapper, FORM_MODE.add, {
              // useLayout: addFormUseLayout,
              // colLength: addFormColLength,
              // formMode: addFormMode,
              // labelWidth: addLabelWidth,
              useLayout: false,
              colLength: 2,
              formMode: 'normal',
              labelWidth: 120,
              datasourceId,
              apiSchemaManager,
            })
            const editFormItems = genFormItems(vSubFields, type_mapper, FORM_MODE.add, {
              // useLayout: addFormUseLayout,
              // colLength: addFormColLength,
              // formMode: addFormMode,
              // labelWidth: addLabelWidth,
              useLayout: false,
              colLength: 2,
              formMode: 'normal',
              labelWidth: 120,
              datasourceId,
              apiSchemaManager,
            })
            // if (selfUpdate) {
            //   addFormItems.unshift({
            //     label: item.toFieldNameLabel || "父id",
            //     name: item.toTableName + "." + item.toFieldName,
            //     value: "${" + item.tableName + ".id}",
            //     type: "input-text",
            //   });
            // }

            const actionsMap = {
              add: {
                actions: [
                  {
                    actionType: 'dialog',
                    dialog: {
                      showCloseButton: false,
                      size: 'md',
                      title: '新增',
                      body: {
                        type: 'form',
                        // mode: addFormMode,
                        // labelWidth: addLabelWidth,
                        title: '新增',
                        data: {},
                        body: addFormItems,
                        resetAfterSubmit: true,
                        onEvent: {
                          submit: {
                            actions: selfUpdate
                              ? [
                                  {
                                    actionType: 'ajax',
                                    api: apiSchemaManager.add2(item.toEntityId, item.toTableName),
                                  },
                                  {
                                    actionType: 'deleteItem',
                                    componentName: fieldName,
                                    args: {
                                      value: {},
                                      index: '${ index }',
                                    },
                                  },
                                  {
                                    actionType: 'reload',
                                    componentName: serviceName,
                                  },
                                  // {
                                  //   actionType: "custom",
                                  //   script: "console.log(event.data)",
                                  // },
                                  // {
                                  //   actionType: "custom",
                                  //   script:
                                  //     "event.setData({...event.data.__super,tableName:{...event.data.__super.tableName,id:event.data.items[0]}})".replace(
                                  //       /tableName/g,
                                  //       item.toTableName
                                  //     ),
                                  // },
                                  // {
                                  //   actionType: "custom",
                                  //   script: "console.log(event.data)",
                                  // },
                                  // {
                                  //   actionType: "setValue",
                                  //   componentName: serviceName,
                                  //   args: {
                                  //     value: "${ event.data }",
                                  //     index: "${ index }",
                                  //   },
                                  // },
                                ]
                              : [
                                  {
                                    actionType: 'setValue',
                                    componentName: fieldName,
                                    args: {
                                      value: '${ event.data }',
                                      index: '${ index }',
                                    },
                                  },
                                ],
                          },
                        },
                      },
                    },
                  },
                ],
              },
              edit: {
                actions: [
                  {
                    actionType: 'dialog',
                    dialog: {
                      showCloseButton: false,
                      // data: {},
                      size: 'md',
                      title: '编辑',
                      body: {
                        type: 'form',
                        // mode: addFormMode,
                        // labelWidth: addLabelWidth,
                        initApi: apiSchemaManager.findOne4Edit2({
                          entityId: item.toEntityId,
                          tableName: item.toTableName,
                          fields: item.extraCfg.subFields,
                        }),
                        title: '编辑',
                        data: '${ item }',
                        body: editFormItems,
                        resetAfterSubmit: true,
                        onEvent: {
                          submit: {
                            actions: selfUpdate
                              ? [
                                  {
                                    actionType: 'ajax',
                                    api: apiSchemaManager.edit2(item.toEntityId, item.toTableName),
                                  },
                                  {
                                    actionType: 'custom',
                                    script: 'console.log(event.data)',
                                  },
                                  {
                                    actionType: 'setValue',
                                    componentName: fieldName,
                                    args: {
                                      value: '${ event.data.__super }',
                                      index: '${ index }',
                                    },
                                  },
                                ]
                              : [
                                  {
                                    actionType: 'setValue',
                                    componentName: fieldName,
                                    args: {
                                      value: '${ event.data }',
                                      index: '${ index }',
                                    },
                                  },
                                ],
                          },
                        },
                      },
                    },
                  },
                ],
              },
              delete: {
                actions: [
                  {
                    actionType: 'confirmDialog',
                    dialog: {
                      title: '提示',
                      msg: '您确定要删除吗？',
                    },
                  },
                  {
                    actionType: 'ajax',
                    api: apiSchemaManager.remove2(
                      item.toEntityId,
                      'event.data.item.tableName'.replace(/tableName/g, item.toTableName)
                    ),
                  },
                ],
              },
            }
            const onEvent = { add: actionsMap.add, edit: actionsMap.edit }
            const columns = genFormItems(
              pick(subFields, tableFields),
              detail_type_mapper,
              FORM_MODE.table,
              { datasourceId, apiSchemaManager }
            )
            if (selfUpdate) {
              onEvent.delete = actionsMap.delete
            }
            if (selfUpdate) {
              const crudName = 'name:' + guid()
              columns.push({
                type: 'operation',
                label: '操作',
                width: 150,
                buttons: [
                  {
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
                        // mode: editFormMode,
                        // labelWidth: editLabelWidth,
                        title: '',
                        body: editFormItems,
                        initApi: apiSchemaManager.findOne4Edit2({
                          entityId: item.toEntityId,
                          tableName: item.toTableName,
                          fields: item.extraCfg.subFields,
                        }),
                        api: apiSchemaManager.edit2(item.toEntityId, item.toTableName),
                        wrapWithPanel: false,
                      },
                    },
                  },
                  {
                    type: 'button',
                    label: '删除',
                    level: 'link',
                    className: 'text-danger',
                    confirmText: '确定要删除？',
                    actionType: 'ajax',
                    api: apiSchemaManager.remove2(
                      item.toEntityId,
                      'tableName'.replace(/tableName/g, item.toTableName)
                    ),
                  },
                ],
              })
              return {
                type: 'crud',
                title: item.toTableNameLabel,
                api: apiSchemaManager.findList2(item.toEntityId, item.extraCfg.subFields, {
                  formParams: {
                    [item.toTableName]: {
                      [item.toFieldName]: '${' + item.tableName + '.id}',
                    },
                  },
                  responseData: {
                    items: '${ records }',
                    total: '${ total }',
                  },
                }),
                columns,
                footerToolbar: [
                  {
                    type: 'button',
                    label: '新增',
                    size: 'sm',
                    icon: 'fa fa-plus',
                    level: 'primary',
                    actionType: 'dialog',
                    target: crudName,
                    dialog: {
                      size: 'md',
                      title: '新增',
                      body: {
                        type: 'form',
                        data: {
                          [item.toTableName + '.' + item.toFieldName]:
                            '${' + item.tableName + '.id}',
                        },
                        // mode: editFormMode,
                        // labelWidth: editLabelWidth,
                        title: '',
                        body: addFormItems,
                        api: apiSchemaManager.add2(item.toEntityId, item.toTableName),
                        wrapWithPanel: false,
                      },
                    },
                  },
                  'pagination',
                ],
              }
            }
            // 表单模式
            return {
              type: 'input-table',
              label: showName,
              name: fieldName,
              addable: true,
              editable: true,
              removable: true,
              columns,
              onEvent,
            }
          }

          if (selfUpdate) {
            // const serviceName = "name:" + guid();
            // return {
            //   type: "service",
            //   name: serviceName,
            //   data: {
            //     page: 1,
            //     perPage: 5,
            //     total: 0,
            //   },
            //   api: apiSchemaManager.findList2(
            //     item.toEntityId,
            //     item.extraCfg.subFields,
            //     {
            //       formParams: {
            //         [item.toTableName]: {
            //           [item.toFieldName]: "${" + item.tableName + ".id}",
            //         },
            //       },
            //       responseData: {
            //         [item.id]: "${ records }",
            //         total: "${ total }",
            //         page: "${ current }",
            //       },
            //     }
            //   ),
            //   body: [
            //     createInputTable(true, serviceName),
            //     {
            //       type: "pagination",
            //       activePage: "${page}",
            //       perPage: "${perPage}",
            //       total: "${total}",
            //       mode: "normal",
            //       onEvent: {
            //         change: {
            //           actions: [
            //             {
            //               actionType: "custom",
            //               script: "console.log(event)",
            //             },
            //             {
            //               actionType: "setValue",
            //               componentName: serviceName,
            //               args: {
            //                 value: {
            //                   page: "${event.data._page}",
            //                 },
            //               },
            //             },
            //           ],
            //         },
            //       },
            //     },
            //   ],
            // };
            return createInputTable(true)
          } else {
            return createInputTable()
          }
        } else {
          // input-table 内编辑
          inputTableSchema = {
            type: 'input-table',
            label: showName,
            name: fieldName,
            editable: true,
            addable: true,
            removable: true,
            columns: genFormItems(
              extraCfg.subFields.filter((ele) => ele.visible),
              type_mapper,
              FORM_MODE.add,
              {
                // 不需要布局
                datasourceId,
                apiSchemaManager,
              }
            ),
          }
          if (item.extraCfg.selfUpdate) {
            const inputTableCols = genFormItems(
              extraCfg.subFields.filter((ele) => ele.visible),
              static_form_mapper,
              FORM_MODE.detail,
              {
                // 不需要布局
                datasourceId,
                apiSchemaManager,
              }
            )
            inputTableCols.unshift({
              name: item.toTableName + '.' + item.toFieldName,
              label: item.toFieldNameLabel || '父id',
              type: 'static',
              value: '${' + item.tableName + '.id}',
              hidden: true,
            })
            inputTableSchema = {
              ...inputTableSchema,
              columns: inputTableCols,
              needConfirm: true,
              addApi: apiSchemaManager.add2(item.toEntityId, item.toTableName),
              updateApi: apiSchemaManager.edit2(item.toEntityId, item.toTableName),
              deleteApi: apiSchemaManager.remove2(item.toEntityId, item.toTableName),
              onEvent: {
                add: {
                  actions: [
                    {
                      actionType: 'custom',
                      script: 'console.log(event.data)',
                    },
                    {
                      actionType: 'setValue',
                      componentName: fieldName,
                      args: {
                        value: {
                          id: '${event.data.__rendererData.tableName.id}'.replace(
                            /tableName/,
                            item.tableName
                          ),
                        },
                        index: '${ index }',
                      },
                    },
                  ],
                },
              },
            }
          }
          return inputTableSchema
        }
        // if (item.extraCfg.selfUpdate) {
        //   const serviceName = "name:" + guid();
        //   return {
        //     type: "service",
        //     name: serviceName,
        //     data: {
        //       page: 1,
        //       perPage: 5,
        //       total: 0,
        //     },
        //     api: apiSchemaManager.findList2(
        //       item.toEntityId,
        //       item.extraCfg.subFields,
        //       {
        //         formParams: {
        //           [item.toTableName]: {
        //             [item.toFieldName]: "${" + item.tableName + ".id}",
        //           },
        //         },
        //         responseData: {
        //           [item.id]: "${ records }",
        //           total: "${ total }",
        //           page: "${ current }",
        //         },
        //       }
        //     ),
        //     body: [
        //       inputTableSchema,
        //       {
        //         type: "pagination",
        //         activePage: "${page}",
        //         perPage: "${perPage}",
        //         total: "${total}",
        //         mode: "normal",
        //         onEvent: {
        //           change: {
        //             actions: [
        //               {
        //                 actionType: "custom",
        //                 script: "console.log(event)",
        //               },
        //               {
        //                 actionType: "setValue",
        //                 componentName: serviceName,
        //                 args: {
        //                   value: {
        //                     page: "${event.data._page}",
        //                   },
        //                 },
        //               },
        //             ],
        //           },
        //         },
        //       },
        //     ],
        //   };
        // }
      }
      let _type = mapper[formType]
      const basicCfg = { label: item.showName }
      /**
       * 剔除一些系统用的非schema字段
       * @param {*} object
       * @returns
       */
      const omitNonSchemaField = (object) => {
        const result = {}
        const omitFields = ['searchType', 'formType', 'valueField']
        for (let key in object) {
          if (!omitFields.includes(key)) {
            result[key] = object[key]
          }
        }

        return result
      }
      const additionCfg = {
        ...omitNonSchemaField(item.extraCfg),
        ...genOptions(item, { datasourceId }),
      }
      const sep = options.separator || separator
      // query
      if (mode === FORM_MODE.query) {
        basicCfg.name = item.tableName + sep + item.fieldName
      }
      // table detail
      else if (mode === FORM_MODE.table || mode === FORM_MODE.detail) {
        basicCfg.name = item.tableName + sep + item.fieldName
      }
      // add edit
      else if (mode === FORM_MODE.add || mode === FORM_MODE.edit) {
        basicCfg.name = item.tableName + sep + item.fieldName
      }
      // 其他模式
      else {
        basicCfg.name = item.fieldName
      }

      if (options?.labelWidth) {
        basicCfg.labelWidth = labelWidth
      }
      // 有function，先解析出来
      if (typeof _type === 'function') _type = _type(item)

      const formatExport = (schema, item) => {
        // 关联表暂未设置extraCfg 所以暂不支持直接配置快速编辑
        if (item?.extraCfg?.quickEdit) {
          // 这里可能会有问题，默认只有name和label属于table-column属性
          const { name, label, ...rest } = schema
          return {
            name,
            label,
            ...rest,
            quickEdit: {
              ...rest,
              static: false,
              mode: item.extraCfg.mode,
              saveImmediately: true,
            },
          }
        }
        return schema
      }
      if (typeof _type === 'string') {
        const result = formatExport(
          {
            ...basicCfg,
            ...additionCfg,
            type: _type,
            placeholder: [FORM_MODE.add, FORM_MODE.edit, FORM_MODE.query].includes(mode)
              ? `请输入${item.showName}`
              : '',
          },
          item
        )
        if (item.fieldName === 'type') {
          console.log('type-schema', result)
        }

        return result
      }

      if (typeof _type === 'object') {
        const { _action = '请输入', ...rest } = _type
        const result = formatExport(
          {
            ...rest,
            ...basicCfg,
            ...additionCfg,
            placeholder: [FORM_MODE.add, FORM_MODE.edit, FORM_MODE.query].includes(mode)
              ? `${_action}${item.showName}`
              : '',
          },
          item
        )
        return result
      }

      console.warn('有异常未处理', item)

      return {
        ...item,
        ...basicCfg,
      }
    })
  if (useLayout) {
    return wrapLayout(result, colLength)
  }
  if (type === 'Eform') {
    return genEFormItems(result, options)
  } else if (type === 'Pform') {
    return genPFormItems(result, options)
  } else {
    return result
  }
}

export const mapModelFieldToPostBodyColumn = (item) => {
  const { tableName, fieldName, showName, isJsonStr } = item
  if (isJsonStr) {
    return [tableName, fieldName, showName, 'JSON']
  }
  return [tableName, fieldName, showName]
}

/**
 * 生成EForm的body配置
 * @param {Array<Object>} items 表单配置
 * @param {Object} mapper 哪种mapper，取值于type-mapper.js
 * @param {*} mode 模式
 * @param {Object} options 额外配置参数
 * @returns
 */
export const genEFormItems = (result, options) => {
  const {
    brderColor,
    labelBackGroundColor,
    colLengthField,
    labelfontColor,
    labelWidth,
    contentWidth,
  } = options
  const newResult = []
  const selectTypeList = ['select']
  const inputTypeList = ['input-rich-text', 'input-number', 'textarea']

  result.map((e) => {
    newResult.push({ type: 'tpl', tpl: e.label, inline: true })
    const select = selectTypeList.includes(e.type)
    const input = inputTypeList.includes(e.type)
    if (input) newResult.push({ ...e, label: '', type: 'input-text' })
    if (select) newResult.push({ ...e, label: '', type: 'radios' })
    if (!input && !select) newResult.push({ ...e, label: '' })
  })
  const results = chunk(newResult, 6)
  const EformList = results.map((e) => {
    const body = {
      tds: [
        ...e.map((el, index) => {
          return {
            body: {
              ...el,
              themeCss: {
                inputControlClassName: {
                  'border:default': {
                    border: 'none!important',
                  },
                },
              },
            },
            width: index % 2 == 0 ? `${labelWidth}px` : `${contentWidth}px`,
            background: index % 2 == 0 ? labelBackGroundColor : '#fff',
            color: index % 2 == 0 ? labelfontColor : '#333',
          }
        }),
      ],
      style: {
        height: 45,
        overflow: 'auto',
      },
    }
    return body
  })
  const Eform = {
    type: 'table-view',
    trs: EformList,
    border: true,
    borderColor: brderColor,
  }
  return Eform
}
export const genPFormItems = (result, options) => {
  console.log(options)
  const {
    brderColor,
    labelBackGroundColor,
    colLengthField,
    labelfontColor,
    labelWidth,
    contentWidth,
  } = options
  const newResult = []
  const selectTypeList = ['select']
  const inputTypeList = ['input-rich-text', 'input-number', 'textarea']
  result.map((e) => {
    // newResult.push({ label: e.label, content: e });
    const select = selectTypeList.includes(e.type)
    const input = inputTypeList.includes(e.type)
    if (input)
      newResult.push({
        ...e,
        label: e.label,
        type: 'input-text',
        content: { ...e, label: '' },
      })
    if (select)
      newResult.push({
        ...e,
        label: e.label,
        type: 'radios',
        content: { ...e, label: '' },
      })
    if (!input && !select) newResult.push({ ...e, label: e.label, content: { ...e, label: '' } })
  })
  const Pform = {
    type: 'property',
    column: colLengthField,
    items: newResult,
    border: true,
    borderColor: brderColor,
    labelStyle: {
      background: labelBackGroundColor,
      color: labelfontColor,
      border: `1px solid ${brderColor}`,
      width: `${labelWidth}px`,
    },
    contentStyle: {
      border: `1px solid ${brderColor}`,
      width: `${contentWidth}px`,
    },
  }
  return Pform
}

/**
 * 递归处理addFormItems
 * @param {*} items
 * @returns
 */
export const recurseTreatAddItems = (items) => {
  const reduceLoop = (array) => {
    const result = []
    const loop = (list) => {
      list.forEach((item) => {
        if (['pickerOne', 'subFormOne'].includes(item.extraCfg.relType)) {
          // 有时候，会将主表的id用作关联字段，导致id字段丢失
          // if (item.fieldName === "id") {
          //   result.push(item);
          // }
          item.visible = false
          result.push(item)
          loop(item.extraCfg.subFields)
        } else {
          result.push(item)
        }
      })
    }
    loop(array)
    return result
  }
  const loop = (array) => {
    array.forEach((item) => {
      if (item.extraCfg.relType) {
        if (item.extraCfg.relType === 'pickerOne') {
          item.extraCfg.subFields = reduceLoop(item.extraCfg.subFields)
        } else {
          loop(item.extraCfg.subFields)
        }
      }
    })
  }
  const result = copy(items)
  loop(result)
  return result
}
