import { AxiosInstance, AxiosStatic, ResponseType } from 'axios'
import { CACHE_LEVEL, memorize } from './cache'
import { copy } from './common'
import { exportExcel } from './file'
import { formType2Operation, genModelScaffoldFormSchema } from './model-util'
import { Router } from './server'
import { TYPE_UTIL } from './type'
import { FetcherConfig } from 'amis-core/lib/factory'
import { FormContainerType } from './types/scaffold-form.type'

export interface FetcherRequestConfig extends FetcherConfig {
  responseType: ResponseType
  query: any
  params?: any // 路径参数
}

/**
 * 统一处理字段的工具
 */
const FieldUtil = {
  prefix: '__sys__',
  fields: ['status'],
  addPrefix(str) {
    if (TYPE_UTIL.isString(str)) {
      return this.prefix + str
    }
  },
  removePrefix(str) {
    if (TYPE_UTIL.isString(str)) {
      return str.replace(this.prefix, '')
    }
  },
  hasPrefix(str) {
    if (TYPE_UTIL.isString(str)) {
      return str.startsWith(this.prefix)
    }
  },
  /**
   * 给对象中系统字段加前缀
   * @param {*} obj
   * @returns
   */
  normalize(obj) {
    // 对象要处理
    if (TYPE_UTIL.isObject(obj)) {
      const result = {}
      for (let key in obj) {
        if (this.fields.includes(key)) {
          result[this.addPrefix(key)] = obj[key]
        } else {
          result[key] = obj[key]
        }
      }
      return result
    }
    // boolean 类型需要包装一下
    if (TYPE_UTIL.isBoolean(obj)) {
      return { data: obj }
    }
    // 非对象直接返回
    return obj
  },
  unNormalize(obj) {
    // FormData 数据不处理
    if (obj instanceof FormData) {
      return obj
    }
    const result = {}
    for (let key in obj) {
      if (this.hasPrefix(key)) {
        result[this.removePrefix(key)] = obj[key]
      } else {
        result[key] = obj[key]
      }
    }
    return result
  },
}

// 删除虚拟字段
function removeVirtualField(columns, mapper) {
  if (Array.isArray(columns) && columns.length > 0) {
    return columns.filter((item) => {
      const isVirtual = item[1].startsWith('children____')
      if (isVirtual) {
        const [str, entityId, tableName] = item[1].split('____')
        mapper[item[1]] = tableName
      }
      return !isVirtual
    })
  }
  return columns
}
/**
 * 递归扁平转对象{'a.b' : 'c'} => a:{b:'c'}
 * @param {Object} item 转换对象
 */
function plateToObject(item) {
  const obj = {}
  for (let key in item) {
    if (key.startsWith('children____')) {
      // children____
      if (TYPE_UTIL.isArray(item[key])) {
        obj[key] = item[key].map((ele) => {
          return plateToObject(ele)
        })
      } else if (TYPE_UTIL.isObject(item[key])) {
        obj[key] = plateToObject(item[key])
      }
    } else {
      // tableName.fieldName
      const [table, field] = key.split('.')
      if (!obj[table]) {
        obj[table] = {}
      }
      obj[table][field] = item[key]
    }
  }
  return obj
}

/**
 * {
 *    field1:{a,c},
 *    field2:{b,d},
 *    'field1.a':3, //合并到对象里去
 * }
 */
function mergeFieldToObject(obj) {
  const result = {}
  const temp = {}
  for (let key in obj) {
    if (key.includes('.')) {
      const [tableName, fieldName] = key.split('.')
      if (!temp[tableName]) {
        temp[tableName] = {}
      }
      temp[tableName][fieldName] = obj[key]
    } else {
      result[key] = obj[key]
    }
  }
  // 遍历temp，合并到result
  for (let prop in temp) {
    if (result[prop]) {
      result[prop] = {
        ...result[prop],
        ...temp[prop],
      }
    } else {
      result[prop] = temp[prop]
    }
  }
  return result
}
/**
 * 判断对象所有字段是否都为null
 * @param {*} obj
 * @returns
 */
function isObjectFieldsNull(obj) {
  for (let prop in obj) {
    if (obj[prop] !== null) {
      return false
    }
  }
  return true
}

/**
 * 从查询参数columns和children中找出JSONString存储的字段
 * @param {Array<object>} columns
 * @param {*} children
 * @returns
 */
function findJsonField(columns, children) {
  const result = {}
  const pickJSON = (array) => {
    array.forEach((col) => {
      if (col.length > 3 && col[3] === 'JSON') {
        // result.push(col);
        const [tableName, fieldName] = col
        if (!result[tableName]) {
          result[tableName] = {}
        }
        result[tableName][fieldName] = 'JSON'
      }
    })
  }
  const loopPickJSON = (array) => {
    array.forEach((entity) => {
      pickJSON(entity.columns)
      if (entity.children && entity.length > 0) {
        loopPickJSON(entity.children)
      }
    })
  }
  pickJSON(columns)
  loopPickJSON(children)
  return result
}

/**
 * 去除数组中json标记
 * @param {*} columns
 * @returns
 */
function cutJsonTag(columns) {
  return columns.map((item) => {
    if (item.length > 3) {
      return item.slice(0, 3)
    }
    return item
  })
}
/**
 * 递归去除JSON tag
 * @param {*} children
 * @returns
 */
function cutJsonTagForChildren(children) {
  return children.map((entity) => {
    const result = {
      ...entity,
      columns: cutJsonTag(entity.columns),
    }
    if (entity.children && entity.children.length > 0) {
      result.children = cutJsonTagForChildren(entity.children)
    }
    return result
  })
}

/**
 * 解析给定对象中的json
 * @param {*} obj
 * @param {*} targets
 * @returns
 */
function parseJson(obj, targets) {
  const result = {}
  for (let key in obj) {
    if (TYPE_UTIL.isObject(obj[key])) {
      if (!result[key]) {
        result[key] = {}
      }
      for (let prop in obj[key]) {
        // 如果在目标对象里
        if (targets[key] && targets[key][prop]) {
          try {
            result[key][prop] = JSON.parse(obj[key][prop])
          } catch (e) {
            console.warn(e)
            result[key][prop] = {}
          }
        } else {
          result[key][prop] = obj[key][prop]
        }
      }
    } else {
      // 其他非object的情况
      result[key] = obj[key]
    }
  }
  return result
}

function treatJsonFile(obj) {
  const retain = (item) => {
    return {
      name: item.name,
      fileName: item.fileName,
      url: item.url,
      // type: item.type,
    }
  }
  if (TYPE_UTIL.isObject(obj)) {
    return retain(obj)
  } else if (Array.isArray(obj)) {
    return obj.map((item) => retain(item))
  }
}

export const fetcherFactory = (axios: AxiosStatic | AxiosInstance) => {
  const router = new Router()
  /**
   * mock 操作符选项数据
   */
  router.route('/mock/operators', (cfg: FetcherRequestConfig) => {
    console.log(cfg)
    if (['text', 'textarea', 'rich_text'].includes(cfg.query.type)) {
      return {
        status: 0,
        msg: '请求成功',
        data: [
          { label: '等于', value: 'eq' },
          { label: '不等于', value: 'ne' },
          { label: '模糊匹配', value: 'like' },
          { label: '模糊匹配（以输入值开头）', value: 'right_like' }, // startWith
          { label: '模糊匹配（以输入值结尾）', value: 'left_like' }, // endWith
        ],
      }
    }

    if (
      ['number', 'point', 'money', 'select', 'date', 'datetime', 'time'].includes(cfg.query.type)
    ) {
      return {
        status: 0,
        msg: '请求成功',
        data: [
          { label: '等于', value: 'eq' },
          { label: '不等于', value: 'ne' },
          { label: '大于', value: 'gt' },
          { label: '大于或等于', value: 'gte' },
          { label: '小于', value: 'lt' },
          { label: '小于或等于', value: 'lte' },
          { label: '介于两者之间', value: 'between' },
          { label: '模糊匹配', value: 'like' },
          { label: '模糊匹配（以输入值开头）', value: 'right_like' }, // startWith
          { label: '模糊匹配（以输入值结尾）', value: 'left_like' }, // endWith
        ],
      }
    }

    if (['on_off'].includes(cfg.query.type)) {
      return {
        status: 0,
        msg: '请求成功',
        data: [
          { label: '等于', value: 'eq' },
          { label: '不等于', value: 'ne' },
        ],
      }
    }

    return {
      status: 0,
      msg: '请求成功',
      data: [],
    }
  })

  /**
   * 数据源各自字典
   */
  router.route(
    '/admin/data/dict/value/list',
    memorize(
      async (cfg: FetcherRequestConfig) => {
        const { data } = await axios(cfg)
        return {
          status: data.code,
          msg: data.msg,
          data: data.data || {},
        }
      },
      (cfg) => {
        return `amis_dict_${cfg.query.datasourceId}_${cfg.query.typeCode}`
      },
      CACHE_LEVEL.sessionStorage
    )
  )

  /**
   * 区域
   */
  router.route(
    'admin/data/area/list',
    memorize(
      async (cfg: FetcherRequestConfig) => {
        const { data } = await axios(cfg)
        return {
          status: data.code,
          msg: data.msg,
          data: data.data || {},
        }
      },
      (cfg) => {
        const { datasourceId, type, parentSn = '' } = cfg.query
        return `amis_dict_${datasourceId}_${type}${parentSn}`
      },
      CACHE_LEVEL.sessionStorage
    )
  )

  /**
   * 系统统一字典
   */
  router.route(
    '/admin/dict/type/:code',
    memorize(
      async (cfg: FetcherRequestConfig) => {
        const { params, ...rest } = cfg
        const { data } = await axios({ ...rest })
        return {
          status: data.code,
          msg: data.msg,
          data: data.data || {},
        }
      },
      (cfg) => {
        return `amis_dict_${cfg.params.code}`
      },
      CACHE_LEVEL.sessionStorage
    )
  )

  /**
   * 级联新增和编辑
   */
  router.route('/admin/entity/data/cascade', async (cfg: FetcherRequestConfig) => {
    const { url, method, data, responseType, ...rest } = cfg
    if (['post', 'put'].includes(method)) {
      if (data.formData) {
        data.formData = copy(data.formData) // 过滤掉无用的继承属性
        const selfUpdateList = data.selfUpdateList || []
        const jsonFileList = data.jsonFileList || []
        delete data.selfUpdateList
        delete data.jsonFileList
        console.log('add', JSON.parse(JSON.stringify(data)))
        const { dataList, tableName, entityId } = data.formData

        // recurse map
        const loop = (rows, entityId, tableName) => {
          return rows.map((item) => {
            const __data = item.data || item // 从data中取出数据
            const children = []
            /**
             * 处理快速编辑提交的字段
             */
            const temp = {}
            Object.keys(__data).forEach((key) => {
              if (key.includes('.')) {
                const [tName, fName] = key.split('.')
                if (!temp[tName]) temp[tName] = {}
                temp[tName][fName] = __data[key]
              }
            })
            for (let prop in temp) {
              if (__data[prop]) {
                __data[prop] = {
                  ...__data[prop],
                  ...temp[prop],
                }
              } else {
                __data[prop] = temp[prop]
              }
            }
            // 得出children
            for (let key in __data) {
              // 处理所有的虚拟字段--子表

              if (
                key.startsWith('children____') &&
                (!selfUpdateList || !selfUpdateList.includes(key))
              ) {
                const [str, entityId, tableName] = key.split('____')

                let list = __data[key]
                let next = []
                if (TYPE_UTIL.isObject(list)) {
                  list = [list]
                }

                if (Array.isArray(list)) {
                  next = loop(list, entityId, tableName)
                }
                children.push({
                  entityId,
                  dataList: next,
                })
              }
            }
            const result = { data: __data[tableName] } as { data: any; children?: Array<any> }
            if (children.length > 0) {
              result.children = children
            }
            return result
          })
        }
        data.formData.dataList = loop(dataList, entityId, tableName)

        /**
         * 对象值的处理
         * @param {*} obj
         * @returns
         */
        const treatRecord = (obj, tableName) => {
          // 遍历处理字段
          // 本系统断言所有字段存储都是基本类型数据，不会有对象或数组类型数据，故对象或数据类型数据转为String类型处理
          const result = {}
          for (let key in obj) {
            const cur = obj[key]
            if (TYPE_UTIL.isArray(cur) || TYPE_UTIL.isObject(cur)) {
              // result[key] = JSON_PREFIX + JSON.stringify(cur); // 转带前缀标识的string
              if (jsonFileList.find((field) => field[0] === tableName && field[1] === key)) {
                // 过滤字段
                result[key] = JSON.stringify(treatJsonFile(cur))
              } else {
                result[key] = JSON.stringify(cur) // 去除前缀
              }
            } else {
              result[key] = cur
            }
          }
          return result
        }
        /**
         * 递归处理
         * @param {*} array
         */
        const recurse = (array) => {
          return array.map(({ entityId, dataList, tableName }) => {
            return {
              entityId,
              dataList: dataList.map(({ data, children }) => {
                const result = {
                  data: treatRecord(data, tableName),
                } as { data: any; children?: any[] }
                if (children && children.length > 0) {
                  result.children = recurse(children)
                }
                return result
              }),
            }
          })
        }
        data.formData = recurse([data.formData])[0]
        console.log('data=>', data)

        const res = await axios({
          url,
          method,
          data,
          responseType,
          ...rest,
        })
        const result = {
          status: res.data.code,
          msg: res.data.msg || '成功',
          data: res.data.data || {},
        }
        return result
      }
    }
  })

  /**
   * 详情接口
   */
  router.route('admin/entity/data/detail', async (cfg: FetcherRequestConfig) => {
    // console.log("detail=>", copy(cfg));
    const { url, method, data, responseType, ...rest } = cfg
    // 虚拟字段
    const vFieldMapper = {}
    const state = {
      columns: data.columns,
      children: data.children,
    }

    // 构建树
    // const tree = {
    //   tableName: data.columns[0][0], // 取第一条记录的tableName
    //   entityId: data.entityId,
    //   children: data.children,
    // };
    data.columns = removeVirtualField(data.columns, vFieldMapper)
    data.columns = cutJsonTag(data.columns)
    data.children = cutJsonTagForChildren(data.children)
    const res = await axios({
      url,
      method,
      data,
      responseType,
      ...rest,
    })
    // 递归处理
    const recurse = (list, targets) => {
      return list.map((item) => {
        const result = parseJson(item, targets)
        for (let key in result) {
          if (key.startsWith('children____')) {
            if (Array.isArray(result[key])) {
              result[key] = recurse(result[key], targets)
            } else {
              result[key] = recurse([result[key]], targets)[0]
            }
          }
        }
        return result
      })
    }

    // const structure = (tree, data) => {
    //   const loop = (list, curData, parentNode) => {
    //     return list.forEach((item) => {
    //       const { tableName, entityId, relType, children } = item;
    //       const childrenField = `children____${entityId}____${tableName}`;
    //       if (relType === "OneToMany") {
    //         // 注意：一对多下面，一对一未处理
    //         parentNode[childrenField] = curData[childrenField];
    //       } else {
    //         const node = { [tableName]: curData[tableName] };
    //         parentNode[childrenField] = node;
    //         if (children) {
    //           loop(children, curData, node);
    //         }
    //       }
    //     });
    //   };
    //   const root = {
    //     [tree.tableName]: data[tree.tableName],
    //   };
    //   loop(tree.children, data, root);

    //   return root;
    // };

    if (res.data.data) {
      res.data.data = plateToObject(res.data.data)
      const jsonFields = findJsonField(state.columns, state.children)
      res.data.data = recurse([res.data.data], jsonFields)[0]
      // res.data.data = structure(tree, res.data.data);
      // console.log("detail=>", res.data.data);
    }

    /*
    // 下一个版本要改成递归处理
    if (res.data.data) res.data.data = plateToObject(res.data.data);
    // 重新赋值给虚拟字段
    Object.keys(vFieldMapper).forEach((key) => {
      const tableName = vFieldMapper[key];
      if (!res.data.data[key]) {
        // 如果已经有了，children____，说明已经处理好了，是array
        // 否则将给虚拟字段赋值
        if (!isObjectFieldsNull(res.data.data[tableName])) {
          res.data.data[key] = {
            [tableName]: res.data.data[tableName],
          };
        }
      }
    });
    const jsonFields = findJsonField(state.columns, state.children);
    console.log("detail-jsonFields", jsonFields);
    const treatRecord = (obj) => {
      if (!obj) return;

      for (let prop in obj) {
        const value = obj[prop];
        if (TYPE_UTIL.isString(value) && value.startsWith(JSON_PREFIX)) {
          obj[prop] = JSON.parse(value.slice(13)); // 去除前缀，并解析
        }
      }
      return obj;
    };
    for (let key in res.data.data) {
      const cur = res.data.data[key];
      if (key.startsWith("children____")) {
        const [str, entityId, tableName] = key.split("____");
        if (TYPE_UTIL.isArray(cur)) {
          cur.forEach((item) => {
            treatRecord(item[tableName]);
          });
        }
      } else {
        treatRecord(cur);
      }
    }
    */

    return {
      status: res.data.code,
      msg: res.data.msg,
      data: res.data.data || {},
    }
  })

  /**
   * 模型
   */
  router.route('/admin/data/model/entity', async (cfg: FetcherRequestConfig) => {
    const { url, method, data, responseType, query, ...rest } = cfg
    const res = await axios({
      url,
      method,
      data,
      responseType,
      ...rest,
    })
    // console.log(copy(res.data.data));
    if (['regionSelect'].includes(query.usePage)) {
      // console.log("region", res);
      const _data = res.data?.data
      if (_data) {
        const options = _data.fields
          .filter((item) => item.isSys === 'N')
          .map((item) => {
            return {
              label: item.showName,
              value: item.fieldName,
            }
          })
        return {
          status: 0,
          msg: '成功',
          data: {
            schema: {
              type: 'group',
              // mode: "horizontal",
              body: [
                {
                  type: 'input-text',
                  name: 'tableName',
                  label: '表名',
                  placeholder: '区域字段所在表',
                  value: _data.tableName,
                  disabled: true,
                },
                {
                  type: 'select',
                  name: 'provinceField',
                  label: '省',
                  placeholder: '请选择省',
                  options,
                  clearable: true,
                },
                {
                  type: 'select',
                  name: 'cityField',
                  label: '市',
                  placeholder: '请选择市',
                  options,
                  clearable: true,
                },
                {
                  type: 'select',
                  name: 'districtField',
                  label: '区',
                  placeholder: '请选择区',
                  options,
                  clearable: true,
                },
              ],
            },
          },
        }
      }
    }
    if (['crud', 'form'].includes(query.usePage)) {
      const _data = res.data?.data
      const treatData = (data) => {
        const loop = (array, parentNode, depth) => {
          return array.map((item) => {
            const {
              toTableName: tableName,
              toTableNameLabel: tableNameLabel,
              toEntityId: entityId,
              type: relType,
              toEntityFields: fields,
              children,
            } = item
            tableList.push(tableName)
            // 关联关系节点
            const relNode = {
              id: undefined,
              tableName,
              tableNameLabel,
              entityId,
              relType,
              children: undefined,
              fields:
                fields?.map((ele) => {
                  return {
                    ...ele,
                    tableName,
                    tableNameLabel,
                    type: ele.formType,
                    pureFieldName: ele.fieldName,
                    visible: true,
                    quickEdit: false,
                    extraCfg: {
                      formType: ele.formType,
                      searchType: formType2Operation(ele),
                    },
                  }
                }) || [],
            }
            if (Array.isArray(children) && children.length > 0) {
              relNode.children = loop(children, relNode, depth + 1)
            }
            tableSet[tableName] = relNode.fields.reduce((acc, item) => {
              acc[item.fieldName] = item.extraCfg.searchType
              return acc
            }, {})
            // 多对一
            if (relType === 'ManyToOne') {
              // 将上一级该字段设置为picker
              parentNode.fields.forEach((ele) => {
                if (ele.fieldName === item.fromFieldName) {
                  ele.toFieldName = item.toFieldName
                  ele.toEntityId = item.toEntityId
                  ele.toTableName = item.toTableName
                  ele.toTableNameLabel = item.toTableNameLabel
                  ele.visible = false // 关联字段默认不显示
                  relNode.id = ele.id
                  // 显示哪个字段
                  ele.showNameOptions = relNode.fields.map(({ showName, fieldName, isSys }) => ({
                    label: showName,
                    value: fieldName,
                    isSys,
                  }))
                  // 关联字段，覆盖原有的extraCfg
                  ele.extraCfg = {
                    formType: 'picker',
                    relType: 'pickerOne',
                    [`relType${depth}`]: 'pickerOne',
                    [`relTypeLabel${depth}`]: ele.fieldName + '(多对一)',
                    subFields: relNode.fields.map((ele) => ({
                      ...ele,
                      visible: false,
                      tableName: item.toTableName,
                    })),
                  }
                }
              })
            }
            // 一对一
            else if (relType === 'OneToOne') {
              // 关联表信息随主表一起填入
              if (item.fromFieldName === 'id') {
                const fieldName = 'children____' + item.toEntityId + '____' + item.toTableName
                relNode.id = fieldName
                // 给主表加虚拟字段
                parentNode.fields.push({
                  entityId: item.toEntityId,
                  tableName: item.fromTableName,
                  fieldName,
                  showName: item.toTableNameLabel,
                  toTableName: item.toTableName,
                  toTableNameLabel: item.toTableNameLabel,
                  id: fieldName,
                  visible: false,
                  isSys: 'N',
                  extraCfg: {
                    formType: 'input-sub-form',
                    relType: 'subFormOne',
                    [`relType${depth}`]: 'subFormOne',
                    [`relTypeLabel${depth}`]: '一对一',
                    subFields: relNode.fields.map((ele) => ({
                      ...ele,
                      visible: true,
                      tableName: item.toTableName,
                    })),
                  },
                  showNameOptions: relNode.fields.map(({ showName, fieldName, isSys }) => ({
                    label: showName,
                    value: fieldName,
                    isSys,
                  })),
                })
              }
              // 关联表作为选项
              else {
                // 将上一级该字段设置为picker
                parentNode.fields.forEach((ele) => {
                  if (ele.fieldName === item.fromFieldName) {
                    ele.toFieldName = item.toFieldName
                    ele.toEntityId = item.toEntityId
                    ele.toTableName = item.toTableName
                    ele.toTableNameLabel = item.toTableNameLabel
                    ele.visible = false
                    relNode.id = ele.id
                    ele.showNameOptions = relNode.fields.map((e) => {
                      return {
                        label: e.showName,
                        value: e.fieldName,
                        isSys: e.isSys,
                      }
                    })
                    ele.extraCfg = {
                      formType: 'picker',
                      relType: 'pickerOne',
                      [`relType${depth}`]: 'pickerOne',
                      [`relTypeLabel${depth}`]: ele.fieldName + '(一对一)',
                      subFields: relNode.fields.map((ele) => ({
                        ...ele,
                        visible: false,
                        tableName: item.toTableName,
                      })),
                    }
                  }
                })
              }
            }
            // 一对多
            else if (relType === 'OneToMany') {
              if (item.fromFieldName === 'id') {
                // 子表的entityId和tableName
                const fieldName = 'children____' + entityId + '____' + tableName
                relNode.id = fieldName
                const vNode = {
                  entityId,
                  tableName: item.fromTableName, // 虚拟节点属于上一级
                  fieldName,
                  showName: item.toTableNameLabel,
                  toFieldName: item.toFieldName,
                  toEntityId: item.toEntityId,
                  toTableName: item.toTableName,
                  toTableNameLabel: item.toTableNameLabel,
                  id: fieldName,
                  visible: false,
                  isSys: 'N',
                  showNameOptions: relNode.fields.map(({ showName, fieldName, isSys }) => ({
                    label: showName,
                    value: fieldName,
                    isSys,
                  })),
                  extraCfg: {
                    formType: 'input-table',
                    relType: 'subFormMany',
                    [`relType${depth}`]: 'subFormMany',
                    [`relTypeLabel${depth}`]: '一对多',
                    subFields: relNode.fields.map((ele) => ({
                      ...ele,
                      visible: true,
                      tableName: item.toTableName,
                    })),
                  },
                }
                // 给主表加虚拟字段

                parentNode.fields.push(vNode)
              } else {
                console.log('待实现', item)
              }
            }

            return relNode
          })
        }
        const { id: entityId, name: tableNameLabel, fields, rels, tableName } = data
        const tableList = []
        const tableSet = {}
        const rootNode = {
          entityId,
          tableName,
          tableNameLabel,
          children: undefined,
          fields: fields.map((item) => {
            return {
              ...item,
              type: item.formType,
              tableName,
              tableNameLabel,
              pureFieldName: item.fieldName,
              visible: true,
              quickEdit: false,
              extraCfg: {
                formType: item.formType,
                searchType: formType2Operation(item),
              },
            }
          }),
        }

        tableList.push(rootNode.tableName)
        tableSet[rootNode.tableName] = rootNode.fields.reduce((acc, item) => {
          acc[item.fieldName] = item.extraCfg.searchType
          return acc
        }, {})
        rootNode.children = loop(rels, rootNode, 0)
        return {
          structData: rootNode,
          tableList,
          tableSet,
        }
      }
      const { structData, tableSet } = treatData(_data)
      const getPlainData = (data) => {
        const result = []
        const recurse = (array) => {
          array.forEach((item) => {
            result.push.apply(result, item.fields)
            if (item.children && item.children.length > 0) {
              recurse(item.children)
            }
          })
        }
        recurse([data])
        return result
      }
      const plainData = getPlainData(structData)
      const { usePage, type } = query as { usePage?: string; type?: FormContainerType }
      const schemaObj = genModelScaffoldFormSchema(structData, {
        type: usePage,
        containerType: type, // schema容器的类型
      })
      // console.log("model", structData);
      console.log('scaffold', schemaObj)
      return {
        status: 0,
        msg: '成功',
        data: {
          structData,
          plainData,
          tableSet,
          schema: schemaObj.schema,
          values: schemaObj.data,
        },
      }
    }
    return {
      status: res.data.code,
      msg: res.data.msg,
      data: res.data.data || {},
    }
  })

  /**
   * 获取crud表单配置持久化数据
   */
  router.route('/admin/app/page/config/', async (cfg: FetcherRequestConfig) => {
    const { url, method, data, responseType, query, ...rest } = cfg
    const res = await axios({
      url,
      method,
      data,
      responseType,
      ...rest,
    })
    if (!res?.data?.data) {
      return {
        status: 0,
        msg: '请求成功',
        data: {
          // features: "query,add,edit,detail,remove",
        },
      }
    }
  })

  // 获取表单持久化数据
  // router.route("/admin/tenant/app/page/config", async (cfg) => {
  //   console.log("get");
  //   if (cfg.method === "get") {
  //     const { url, method, data, responseType, query, ...rest } = cfg;
  //     const res = await axios({
  //       url,
  //       method,
  //       data,
  //       responseType,
  //       ...rest,
  //     });
  //     if (res.data?.data?.configJson) {
  //       try {
  //         const json = JSON.parse(res.data.data.configJson);
  //         return {
  //           status: 0,
  //           msg: "请求成功",
  //           data: json,
  //         };
  //       } catch (e) {
  //         return {
  //           status: 0,
  //           msg: "请求成功",
  //           data: {},
  //         };
  //       }
  //     }
  //   }
  // });

  /**
   * 批量导入模板下载
   */
  router.route('/admin/entity/data/import/template', async (cfg: FetcherRequestConfig) => {
    const { url, method, data, responseType, query, ...rest } = cfg
    const res = await axios({
      url,
      method,
      data,
      responseType,
      ...rest,
    })
    exportExcel(res.data, res.headers['content-type'], '模板.xlsx')
    return {
      status: 0,
      msg: '',
      data: {},
    }
  })

  return async (cfg: FetcherConfig & { responseType: ResponseType; query: any }) => {
    if (cfg.data) {
      cfg.data = FieldUtil.unNormalize(cfg.data)
    }
    const matchResult = await router.match(cfg)
    if (matchResult) {
      return matchResult
    }
    const { url, method, data, responseType, ...rest } = cfg
    const state = {
      virtualMapper: {},
      columns: null,
      children: null,
    }
    /**
     * findList 和 数据导出 请求拦截处理
     */
    if (url.includes('admin/entity/data/page') || url.includes('/admin/entity/data/export')) {
      // 构造参数
      const { formParams, tableSet, columns, criteria } = data
      console.log('findList', copy(data))
      state.columns = data.columns
      state.children = data.children
      data.columns = removeVirtualField(columns, state.virtualMapper)
      // 去掉JSON标记
      data.columns = cutJsonTag(data.columns)
      data.children = cutJsonTagForChildren(data.children)
      if (!criteria) {
        const __criteria = []
        // console.log("formParams", formParams);
        for (let key in formParams) {
          if (tableSet[key]) {
            // 该字段是表
            for (let prop in formParams[key]) {
              if (formParams[key][prop] === '') {
                continue
              }
              let startValue = ''
              let endValue = ''
              if (tableSet[key][prop] === 'between') {
                const [start, end] = formParams[key][prop].split(',')
                if (start === '' || start === undefined) {
                  //,1000
                  tableSet[key][prop] = 'lt'
                } else {
                  startValue = isNaN(start) ? start : +start
                }
                if (end === '' || end === undefined) {
                  // 1000,
                  tableSet[key][prop] = 'gt'
                } else {
                  endValue = isNaN(end) ? end : +end
                }
              } else {
                startValue = formParams[key][prop]
              }
              __criteria.push({
                tableName: key,
                fieldName: prop,
                type: tableSet[key][prop],
                startValue,
                endValue,
              })
            }
          } else {
            // 其他数据，暂不处理，如果需要可以扩展
          }
        }
        // for (let table in tableSet) {
        //   if (table === "$$id") {
        //     continue;
        //   }

        //   for (let field in tableSet[table]) {
        //     if (field === "$$id") {
        //       continue;
        //     }
        //     if (formParams[table] && formParams[table][field]) {
        //       debugger;
        //       let startValue = "";
        //       let endValue = "";
        //       if (tableSet[table][field] === "between") {
        //         const values = formParams[table][field].split(",");
        //         startValue = values[0];
        //         endValue = values[1];
        //       } else {
        //         startValue = formParams[table][field];
        //       }
        //       __criteria.push({
        //         tableName: table,
        //         fieldName: field,
        //         type: tableSet[table][field],
        //         startValue,
        //         endValue,
        //       });
        //     }
        //   }
        // }
        data.criteria = __criteria
        delete data.formParams
        delete data.tableSet
      }
    }

    /**
     * 真正调接口
     */
    const res = await axios({
      url,
      method,
      data,
      responseType,
      ...rest,
    })

    // CRUD findList 拦截处理
    if (url.includes('admin/entity/data/page')) {
      if (!data._dataType) {
        const jsonFields = findJsonField(state.columns, state.children)
        // 扁平转对象
        if (res.data.data)
          res.data.data.records = res.data.data.records
            .map(plateToObject)
            .map((item) => parseJson(item, jsonFields))
            .map((item) => {
              return {
                ...item,
                id: item[data.tableName].id,
              }
            })

        // 给JSON字段做解析处理
        // console.log("records", res.data.data);
        return {
          status: res.data.code,
          msg: res.data.msg,
          data: res.data.data || {},
        }
      } else if (data._dataType === 'plain') {
        // 不处理，兼容用
      } else if (data._dataType === 'plain2') {
        console.log('plain', res.data)
        if (res.data.data) {
          res.data.data.records = res.data.data.records.map((item) => {
            const temp = {}
            for (let key in item) {
              temp[key.replace(/\./, '_')] = item[key]
            }
            return temp
          })
        }
      }
    }

    // 统一导出
    if (cfg.responseType === 'blob') {
      // const filename =
      //   cfg?.query?.fileName || cfg?.data.fileName || "导出.xlsx";
      const { query = {}, data = {} } = cfg
      const filename =
        query.fileName || query.filename || data.fileName || data.filename || '导出.xlsx'
      exportExcel(res.data, res.headers['content-type'], filename)
      return {
        status: 0,
        msg: '',
        data: {},
      }
    }
    console.log(res.data)
    return {
      status: res.data.code,
      msg: res.data.msg,
      data: FieldUtil.normalize(res.data.data) || {}, // data不可以为null，否则amis会报错：没有response Data
    }
  }
}
