import { TYPE_UTIL } from '../type'

export class SchemaRawParser {
  constructor(schema) {
    this.schema = schema
  }

  // public
  toMap(array) {
    return array.reduce((acc, item) => {
      const name = item.name || item.type
      acc[name] = item
      return acc
    }, {})
  }

  isUseLayout(array) {
    return array.length === 1 && array[0].type === 'grid'
  }

  toMap2(array) {
    if (TYPE_UTIL.isObject(array)) {
      array = [array]
    }
    if (Array.isArray(array) && array.length > 0) {
      if (this.isUseLayout(array)) {
        return this.toMap(array[0].columns.map((item) => item.body))
      }
      return this.toMap(array)
    }
    return {}
  }

  getQueryMap() {
    const isUseLayout = (array) => {
      // 目前布局默认用的grid
      return array.length === 1 && array[0].type === 'grid'
    }
    const { filter } = this.schema

    if (filter.body && filter.body.length > 0) {
      // 使用布局情况
      if (isUseLayout(filter.body)) {
        const columns = filter.body[0].columns
        if (columns) {
          return this.toMap(columns.map((item) => item.body))
        }
      }
      // 不使用布局
      return this.toMap(filter.body)
    }
    return {}
  }

  getMapByType(actionType, actions) {
    const { schema } = this

    let action = null
    if (actionType === 'add') {
      if (schema?.filter?.actions) {
        action = schema.filter.actions.find((item) => item.label === '新增')
      } else if (schema?.headerToolbar) {
        action = schema.headerToolbar.find((item) => item.label === '新增')
      }
    } else if (actionType === 'edit') {
      action = actions.find((item) => item.label === '编辑')
    } else if (actionType === 'detail') {
      action = actions.find((item) => item.label === '详情')
    }

    console.log('增-改-查:action=>', action)
    if (action) {
      const form = action?.dialog?.body
      if (form) {
        return this.toMap2(form.body)
      }
    }
    return {}
  }

  getTableMap() {
    return this.toMap(this.schema.columns)
  }
}
