import { loopOnlyVisible, getIdMap } from '../model-util'
import { mapModelFieldToPostBodyColumn } from '../schema-util'
export class ApiSchemaManager {
  constructor(formValues) {
    this.formValues = formValues
    const { plainData, structData, tableSet } = window.modelScaffoldFormData
    this.plainData = plainData
    this.structData = structData
    this.tableSet = tableSet
    this.appId = sessionStorage.getItem('appId')
  }

  searchNode(entityId) {
    const { structData } = this

    const loopSearch = (array, entityId) => {
      const stack = array
      let index = 0
      while (index <= stack.length - 1) {
        if (stack[index].entityId === entityId) {
          return stack[index]
        }
        if (stack[index].children) {
          stack.push(...stack[index].children)
        }
        index++
      }
    }

    const result = loopSearch([structData], entityId)
    if (!result) {
      console.log({ entityId, structData })
    }

    return result
  }

  /**
   * 按节点生成findList
   */
  findList2(entityId, items, options = {}) {
    const { tableSet } = this
    const { data = {} } = options

    const formParams = options.formParams || { '&': '$$' }
    const responseData = options.responseData || {
      items: '${ records }',
      total: '${ total }',
    }

    const node = this.searchNode(entityId)

    if (!node) {
      console.error('未找到目标picker节点')
      return
    }

    const vColumns = items.filter(
      (item) => item.tableName === node.tableName && (item.visible || item.fieldName === 'id')
    )
    return {
      method: 'post',
      url: '/admin/entity/data/page?current=${page}&size=${perPage}',
      data: {
        ...data, // 自定义传参
        entityId: node.entityId,
        tableName: node.tableName,
        columns: vColumns.map(mapModelFieldToPostBodyColumn),
        children: node.children
          ? loopOnlyVisible(
              node.children,
              getIdMap(items, { noSubFormMany: true }).idMapper // 一对多不支持
            )
          : [],
        tableSet,
        formParams,
      },
      responseData,
    }
  }

  findList() {
    const { structData, tableSet } = this
    const { __tableItems } = this.formValues
    const visibleIdMapper = getIdMap(__tableItems).idMapper
    const vColumns = structData.fields.filter(
      (item) =>
        !item.id.startsWith('children____') && (visibleIdMapper[item.id] || item.fieldName === 'id')
    )
    return {
      method: 'post',
      url: '/admin/entity/data/page?current=${page}&size=${perPage}',
      data: {
        entityId: structData.entityId,
        tableName: structData.tableName,
        columns: vColumns.map(mapModelFieldToPostBodyColumn),
        children: loopOnlyVisible(structData.children, visibleIdMapper),
        tableSet,
        formParams: { '&': '$$' },
      },
      responseData: {
        items: '${ records }',
        total: '${ total }',
      },
    }
  }

  findOne2({ entityId, tableName, fields, children, fromTableName, toFieldName, visibleIdMapper }) {
    const vColumns = fields.filter(
      (item) =>
        !item.id.startsWith('children____') && (visibleIdMapper[item.id] || item.fieldName === 'id')
    )
    return {
      method: 'post',
      url: '/admin/entity/data/detail',
      data: {
        entityId,
        columns: vColumns.map(mapModelFieldToPostBodyColumn),
        criteria: [
          {
            fieldName: 'id',
            type: 'eq',
            startValue: '${tableName.id}'.replace(/tableName/, tableName),
            endValue: '',
            tableName,
          },
        ],
        children,
        // criteria: structData.fields
        //   .filter((item) => item.fieldName === "id")
        //   .map((item) => {
        //     const { tableName, fieldName, extraCfg = {} } = item;
        //     const { searchType } = extraCfg;
        //     const __fieldName = `${tableName}.${fieldName}`;
        //     if (searchType === "between") {
        //       return {
        //         fieldName,
        //         type: searchType,
        //         tableName,
        //         startValue:
        //           "${" + __fieldName + "?:SPLIT(" + __fieldName + ")[0]:''}",
        //         endValue:
        //           "${" + __fieldName + "?:SPLIT(" + __fieldName + ")[1]:''}",
        //       };
        //     }
        //     return {
        //       fieldName,
        //       type: searchType,
        //       startValue: "${" + __fieldName + "}",
        //       endValue: "",
        //       tableName,
        //     };
        //   }),
      },
    }
  }

  findOne(childrenStruct, visibleIdMapper, fields) {
    const { structData, plainData } = this
    // 递归取出所有字段
    // console.log("structData", structData);
    fields = fields || structData.fields
    const vColumns = fields.filter(
      (item) =>
        !item.id.startsWith('children____') && (visibleIdMapper[item.id] || item.fieldName === 'id')
    )
    return {
      method: 'post',
      url: '/admin/entity/data/detail',
      data: {
        entityId: structData.entityId,
        columns: vColumns.map(mapModelFieldToPostBodyColumn),
        criteria: structData.fields
          .filter((item) => item.fieldName === 'id')
          .map((item) => {
            const { tableName, fieldName, extraCfg = {} } = item
            const { searchType } = extraCfg
            const __fieldName = `${tableName}.${fieldName}`
            if (searchType === 'between') {
              return {
                fieldName,
                type: searchType,
                tableName,
                startValue: '${' + __fieldName + '?:SPLIT(' + __fieldName + ")[0]:''}",
                endValue: '${' + __fieldName + '?:SPLIT(' + __fieldName + ")[1]:''}",
              }
            }
            return {
              fieldName,
              type: searchType,
              startValue: '${' + __fieldName + '}',
              endValue: '',
              tableName,
            }
          }),
        children: childrenStruct,
      },
    }
  }

  findOne4Detail() {
    const { structData } = this
    const { __detailFormItems } = this.formValues
    const visibleIdMapper = getIdMap(__detailFormItems).idMapper
    return this.findOne(
      loopOnlyVisible(structData.children, visibleIdMapper, true),
      visibleIdMapper
    )
  }

  findOne4Edit() {
    const { structData } = this
    const { __editFormItems } = this.formValues
    const visibleIdMapper = getIdMap(__editFormItems).idMapper
    // console.log("visible", visibleIdMapper);
    return this.findOne(
      loopOnlyVisible(structData.children, visibleIdMapper, true),
      visibleIdMapper
    )
  }

  findOne4Edit2({ entityId, tableName, fields }) {
    console.log(entityId, tableName)
    const visibleIdMapper = getIdMap(fields).idMapper
    // console.log("edit2", items, visibleIdMapper);
    const node = this.searchNode(entityId)
    if (!node) {
      console.error('未找到节点')
      return
    }
    console.log('node', node)
    const children = node.children || []
    return this.findOne2({
      entityId,
      tableName,
      fields,
      children: loopOnlyVisible(children, visibleIdMapper, true),
      visibleIdMapper,
    })
  }

  add() {
    // const { structData, appId } = this;
    // console.log("structData", structData);
    // return {
    //   method: "post",
    //   url: "/admin/entity/data/cascade",
    //   convertKeyToPath: false,
    //   data: {
    //     appId,
    //     formData: {
    //       entityId: structData.entityId,
    //       tableName: structData.tableName,
    //       dataList: [{ data: { "&": "$$" } }],
    //     },
    //   },
    // };
    const { entityId, tableName } = this.structData
    return this.add2(entityId, tableName)
  }

  /**
   * 按需新增
   */
  add2(entityId, tableName, data = {}) {
    const { appId, formValues } = this
    const loopFindSelfUpdate = (items) => {
      const jsonFileList = []
      const loop = (list) => {
        list.forEach((item) => {
          if (['picture'].includes(item.extraCfg.formType) && item.isJsonStr) {
            jsonFileList.push([item.tableName, item.fieldName])
          }
        })
      }
      loop(items)
      return {
        jsonFileList,
      }
    }
    const { jsonFileList } = loopFindSelfUpdate(formValues.__addFormItems)
    return {
      method: 'post',
      url: '/admin/entity/data/cascade',
      convertKeyToPath: false,
      data: {
        appId,
        jsonFileList,
        formData: {
          entityId,
          tableName,
          dataList: [{ data: { ...data, '&': '$$' } }],
        },
      },
    }
  }

  edit() {
    const { structData } = this
    return this.edit2(structData.entityId, structData.tableName)
  }

  /**
   * 按需更新
   * @param {*} entityId
   * @param {*} tableName
   * @returns
   */
  edit2(entityId, tableName) {
    const { appId, formValues } = this
    const loopFindSelfUpdate = (items) => {
      const selfUpdateList = []
      const jsonFileList = []
      const loop = (list) => {
        list.forEach((item) => {
          if (item.id.startsWith('children____')) {
            if (item.extraCfg.selfUpdate) {
              selfUpdateList.push(item.id)
            }
            loop(item.extraCfg.subFields)
          } else if (['picture'].includes(item.extraCfg.formType) && item.isJsonStr) {
            jsonFileList.push([item.tableName, item.fieldName])
          }
        })
      }
      loop(items)
      return {
        selfUpdateList,
        jsonFileList,
      }
    }
    const { selfUpdateList, jsonFileList } = loopFindSelfUpdate(formValues.__editFormItems)
    return {
      method: 'put',
      url: '/admin/entity/data/cascade',
      data: {
        selfUpdateList,
        jsonFileList,
        appId,
        formData: {
          entityId,
          tableName,
          dataList: [{ data: { '&': '$$' } }],
        },
      },
    }
  }

  remove() {
    const { structData } = this
    const { entity } = this.formValues
    return {
      method: 'delete',
      url: '/admin/entity/data/${' + structData.tableName + '.id}?entityId=' + entity,
    }
  }

  remove2(entityId, tableName) {
    return {
      method: 'delete',
      url: '/admin/entity/data/${' + tableName + '.id}?entityId=' + entityId,
    }
  }

  batchRemove() {
    const { entity } = this.formValues
    return {
      url: '/admin/entity/data/batch/delete',
      method: 'post',
      data: {
        ids: '${ SPLIT(ids) }',
        entityId: entity,
      },
    }
  }

  import() {
    const { structData } = this
    const { __importItems } = this.formValues
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
    return {
      templateApi: {
        method: 'post',
        url: '/admin/entity/data/import/template',
        data: nestedShape,
        responseType: 'blob',
      },
      api: {
        url: '/admin/entity/data/import',
        method: 'post',
        data: {
          queryEntityDataJson: JSON.stringify(nestedShape),
        },
      },
    }
  }

  export() {
    const { structData, tableSet } = this
    const { __exportItems } = this.formValues
    return {
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
    }
  }
}
