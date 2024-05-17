import { cloneDeep } from 'lodash'
import { mapModelFieldToPostBodyColumn } from './schema-util'
import { TYPE_UTIL } from './type'
import { QueryEntity } from './types/crud.type'
import { FormContainerType } from './types/scaffold-form.type'
import { SchemaNode } from 'amis-core'

interface LayoutFormItemConfig {
  containerType?: string
  useLayout?: boolean
  colLength?: number | number
}
/**
 * 操作类型映射，根据模型formType，给出操作符，如like | eq | between
 * @param {*} item
 * @returns
 */
export const formType2Operation = (item) => {
  const likeFields = ['text', 'textarea', 'rich_text']
  const equalFields = ['select', 'radios', 'checkboxes', 'button-group-select']
  const rangeFields = [
    'number',
    'point',
    'money',
    'date',
    'datetime',
    'time',
    'dates',
    'datetimes',
    'times',
  ]
  if (likeFields.includes(item.formType)) {
    return 'like'
  }
  if (equalFields.includes(item.formType)) {
    return 'eq'
  }
  if (rangeFields.includes(item.formType)) {
    return 'between'
  }
  return 'eq'
}

class FieldListPipe {
  // 需要去除的系统字段
  basicSysFields = ['delFlag', 'tenantId', 'deleted', 'tenant_id', 'version']

  // 需要隐藏的字段的属性
  hiddenFieldProps = [
    'createBy',
    'createTime',
    'delFlag',
    'updateBy',
    'updateTime',
    'startDate',
    'startDateTips',
    'endDate',
    'endDateTips',
    'currency',
    'currencyStr',
    'maxLengthTips',
    'maxValueTips',
    'minLengthTips',
    'minValueTips',
    'regularTips',
    'textTypeTips',
    'pureFieldName',
    'uniqued',
    'formTypeStr',
  ]
  /**
   *
   * @param {*} fields
   * @returns {Array} fields
   */
  hideBasicSysFields(fields) {
    return fields.filter((item) => !this.basicSysFields.includes(item.fieldName))
  }

  hideBasicSysFields4Options(fields) {
    return fields.filter((item) => !this.basicSysFields.includes(item.value))
  }

  /**
   * 隐藏字段的一些不需要的属性
   * @param {*} fields
   * @returns
   */
  hideFieldSysProps(fields) {
    return fields.map((item) => {
      const result = {}
      for (let key in item) {
        if (!this.hiddenFieldProps.includes(key)) {
          result[key] = item[key]
        }
      }
      return result
    })
  }
}

/**
 * 保留必要的字段
 * @param {*} item
 * @returns
 */
export const map__necessaryFields = (item) => {
  return {
    id: item.id,
    entityId: item.entityId,
    isSys: item.isSys,
    fieldName: item.fieldName,
    showName: item.showName,
    formType: item.formType,
    formTypeStr: item.formTypeStr,
    required: item.required,
    optionsType: item.optionsType,
    optionsValue: item.optionsValue,
  }
}

/**
 * 按是否是系统字段排序，非系统字段靠前
 */
export const sort__nonSysFirst = (a, b) => {
  if (a.isSys === 'N' && b.isSys === 'Y') {
    return -1
  }
  if (a.isSys === 'Y' && b.isSys === 'N') {
    return 1
  }
  return 0
}

export const filter__retainNonSys = (item) => item.isSys === 'N'

/**
 * 保留可见字段
 * @param {*} item
 * @returns
 */
export const filter__retainVisible = (item) => item.visible

export const FormTypeList = [
  { value: 'select', label: '下拉框', canEdit: true },
  { value: 'button-group-select', label: '按钮组点选', canEdit: true },
  { value: 'radios', label: '单选框', canEdit: true },
  { value: 'checkboxes', label: '复选框', canEdit: true },
  // { value: "switch", label: "开关", canEdit: true },

  { value: 'on_off', label: '开关', canEdit: true },

  { value: 'text', label: '文本框', canEdit: false },
  { value: 'point', label: '数字输入框', canEdit: false },
  { value: 'textarea', label: '多行输入框', canEdit: false },
  { value: 'rich_text', label: '富文本', canEdit: false },
  { value: 'number', label: '数字输入框', canEdit: false },
  { value: 'picker', label: '列表选择器', canEdit: false },
  { value: 'input-sub-form', label: '子表单', canEdit: false },
  { value: 'input-table', label: '表格输入器', canEdit: false },
  { value: 'date', label: '日期选择器', canEdit: false },
  { value: 'datetime', label: '日期时间选择器', canEdit: false },
  { value: 'attachment', label: '附件', canEdit: false },
  { value: 'picture', label: '图片', canEdit: false },

  { value: '__table', label: '关联表', canEdit: false },
]
/**
 * 创建字段列表
 * @param {{name:string;label:string;value:object;feature:string}} config
 * @returns
 */
function createFieldListFormItem({ name, label = '字段列表', value, feature, containerType }) {
  // 求关系树的深度
  const getDepth = (formItems) => {
    let result = 0
    const loop = (list, depth) => {
      if (result < depth) {
        result = depth
      }
      list.forEach((item) => {
        if (item.extraCfg.relType) {
          loop(item.extraCfg.subFields, depth + 1)
        }
      })
    }
    loop(formItems, 0)
    return result
  }
  // 递归创建schema
  const genSchema = (maxDepth: number) => {
    const loop = (depth: number, name: string) => {
      let nextCombo = null
      if (depth < maxDepth) {
        nextCombo = loop(depth + 1, 'subFields')
      }
      // 创建combo
      const combo: SchemaNode = {
        type: 'combo',
        name,
        mode: 'normal',
        label,
        multiple: true,
        draggable: true,
        removable: false,
        addable: false,
        canAccessSuperData: false,
        items: getComboItems(depth),
        ...(containerType === 'panelBody'
          ? {
              onChange(value, oldValue, model, form) {
                this.handlePanelBodyFormChange(value, oldValue, model, form)
              },
            }
          : {}),
      }

      if (depth > 0) {
        const prevDepth = depth - 1
        combo.visibleOn =
          "${ARRAYINCLUDES(['pickerOne','subFormOne','subFormMany'],extraCfg.relType" +
          prevDepth +
          ')}'
      }

      if (nextCombo) {
        const tar = combo.items.find((item) => item.name === 'extraCfg')
        if (tar) {
          tar.form.body.push(nextCombo)
        }
      }
      return combo
    }
    return loop(0, name)
  }
  const depth = getDepth(value)
  const schema = genSchema(depth)

  function getComboItems(depth: number) {
    const nextDepth = depth + 1
    const curRelType = 'relType' + depth
    const nextRelType = 'extraCfg.relType' + nextDepth
    let extraCfgVisibleOn = ''

    const parseTemplate = (exp: string) => {
      return exp.replace(/curRelType/g, curRelType).replace(/nextRelType/g, nextRelType)
    }
    if (depth > 0) {
      extraCfgVisibleOn = parseTemplate(
        "&& ( curRelType ? (curRelType === 'pickerOne' ? nextRelType === 'pickerOne' : true ) : true )"
      )
    }
    const comboItems = [
      {
        name: 'showName',
        visibleOn: '${!extraCfg.relType' + depth + '}',
        type: 'tooltip-wrapper',
        tooltipTheme: 'dark',
        placement: 'left',
        inline: true,
        content: '${ fieldName }',
        body: {
          type: 'tpl',
          tpl: '<span class="${IFS(extraCfg.relType==="pickerOne","bg-yellow-500",extraCfg.relType==="subFormOne","bg-green-500",extraCfg.relType==="subFormMany","bg-purple-500","bg-black")} text-gray-200 px-2 py-1 rounded mt-3">${showName}</span>',
        },
      },
      {
        name: 'showName',
        visibleOn: '${extraCfg.relType' + depth + '}',
        type: 'tooltip-wrapper',
        inline: true,
        tooltipTheme: 'dark',
        placement: 'left',
        title: '${extraCfg.relTypeLabel' + depth + '}${toTableNameLabel}',
        content: '${toTableName}.${toFieldName}',
        body: {
          type: 'tpl',
          tpl: '<span class="${IFS(extraCfg.relType==="pickerOne","bg-yellow-500",extraCfg.relType==="subFormOne","bg-green-500",extraCfg.relType==="subFormMany","bg-purple-500","bg-black")} text-gray-200 px-2 py-1 rounded mt-3">${showName}</span>',
        },
      },
      {
        name: 'visible',
        type: 'switch',
        width: '100px',
        disabledOn: "${ extraCfg.formType === '__unavailable' }",
      },
      {
        name: 'extraCfg',
        type: 'input-sub-form',
        btnLabel:
          "${ IFS(extraCfg.formType==='__table',toTableNameLabel,formTypeMapper[extraCfg.formType],formTypeMapper[extraCfg.formType],extraCfg.formType) }",
        visibleOn:
          "${ visible && (!ARRAYINCLUDES(['import','export'],'" +
          feature +
          "') || extraCfg.relType) && extraCfg.formType !== '__unavailable' " +
          extraCfgVisibleOn +
          ' }', // 一对多table 不可用
        form: {
          title: '${ IFS(relType,toTableNameLabel,showName) }',
          body: [
            // 可切换表单类型
            {
              label: '表单项类型',
              name: 'formType',
              type: 'select',
              visibleOn: "${ ARRAYINCLUDES(['select','on_off'],type) && visible }",
              options: FormTypeList.filter((item) => item.canEdit),
              show(row) {
                return ['query', 'table', 'add', 'edit'].includes(row.feature)
              },
            },
            // 不可切换表单类型
            {
              label: '表单项类型',
              name: 'formType',
              type: 'select',
              visibleOn: "${ type!=='select'  && visible }",
              options: FormTypeList.filter((item) => !item.canEdit),
              disabled: true,
              static: true,
              show(row) {
                return ['query', 'add', 'edit'].includes(row.feature)
              },
            },
            {
              label: '多选',
              type: 'switch',
              name: 'multiple',
              visibleOn: "${ ARRAYINCLUDES(['select','button-group-select'],formType) }",
              show(row) {
                return ['query', 'add', 'edit'].includes(row.feature)
              },
            },
            {
              label: '匹配规则',
              name: 'searchType',
              type: 'select',
              visibleOn: '${ visible && !relType }',
              source: '/mock/operators?type=${type}',
              show(row) {
                return ['query'].includes(row.feature)
              },
            },
            /**
             * 表格输入器配置 START
             * 表格输入器模式
             */
            {
              label: '编辑模式',
              name: 'inputTableMode',
              type: 'select',
              options: [
                { value: 'inline', label: '在表格内编辑' },
                { value: 'form', label: '弹出表单编辑' },
              ],
              value: 'form',
              visibleOn: "${ formType === 'input-table' }",
            },
            {
              name: 'tableFields',
              type: 'checkboxes',
              className: 'my-form-item',
              columnsCount: 2,
              label: '表格字段',
              value: '',
              source: '${ showNameOptions }',
              visibleOn: "${ formType === 'input-table' && inputTableMode === 'form' }",
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              label: '是否按需更新',
              name: 'selfUpdate', // 是否按需更新
              type: 'switch',
              value: false,
              visibleOn: parseTemplate(
                "${ ARRAYINCLUDES(['subFormMany','subFormOne'],curRelType) }"
              ),
              show(row) {
                return ['edit'].includes(row.feature)
              },
            },
            // END
            /**
             * N...1 和 1[id]...1
             * 表格选择器
             */
            {
              name: 'valueField',
              type: 'input-text',
              label: '关联的字段',
              value: '${ toFieldName }',
              disabled: true,
              hidden: true,
              // visibleOn: parseTemplate(
              //   "${ ARRAYINCLUDES(['pickerOne'],nextRelType) }"
              // ),
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              name: 'dialogSize',
              type: 'button-group-select',
              label: '弹窗尺寸',
              visibleOn: parseTemplate("${ curRelType === 'pickerOne' }"),
              options: [
                { label: '极小', value: 'xs' },
                { label: '小', value: 'sm' },
                { label: '中等', value: 'md' },
                { label: '大', value: 'lg' },
              ],
              value: 'md',
              required: true,
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              name: 'labelField',
              type: 'select',
              label: '回显字段',
              required: true,
              source: '${ showNameOptions }',
              visibleOn: parseTemplate("${ curRelType === 'pickerOne' }"),
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              name: 'queryFields',
              type: 'checkboxes',
              className: 'my-form-item',
              columnsCount: 2,
              label: '查询表单',
              value: '',
              source: '${ showNameOptions }',
              visibleOn: parseTemplate("${ curRelType === 'pickerOne' }"),
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              name: 'joinMode',
              label: '字段连接方式',
              type: 'button-group-select',
              className: 'my-form-item',
              visibleOn: parseTemplate("${ curRelType === 'pickerOne' }"),
              options: [
                { label: '表名.属性', value: 'dot' },
                { label: '表名_属性', value: 'underline' },
              ],
              value: 'underline',
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              label: '回显存储字段',
              name: 'targetLabelField',
              type: 'input-text',
              className: 'my-form-item',
              visibleOn: parseTemplate("${ curRelType === 'pickerOne' }"),
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            // END
            // N...1 和 1[id]...1 展示模式，非列表选择器
            /**
             * 1...1[id]
             * 子表单
             */
            {
              label: '展示形式',
              name: 'type',
              type: 'select',
              value: 'combo',
              options: [
                { label: '嵌套表单', value: 'input-sub-form' },
                { label: '直接展示', value: 'combo' },
              ],
              visibleOn: parseTemplate("${ curRelType === 'subFormOne' }"),
              show(row) {
                return ['add', 'edit'].includes(row.feature)
              },
            },
            {
              label: '快速编辑',
              name: 'quickEdit',
              type: 'switch',
              visibleOn: "${ !relType && isSys==='N' }",
              show(row) {
                return ['table'].includes(row.feature)
              },
            },
            {
              name: 'mode',
              label: '快速编辑方式',
              type: 'button-group-select',
              visibleOn: '${ quickEdit }',
              options: [
                { label: '弹出式', value: '' },
                { label: '嵌入式', value: 'inline' },
              ],
              value: 'inline',
              show(row) {
                return ['table'].includes(row.feature)
              },
            },
            {
              type: 'group',
              visibleOn: "${ formType === 'on_off' && type === 'select' }",
              body: [
                {
                  name: 'trueValue',
                  visibleOn: "${ optionsType === '1' }",
                  label: '真值',
                  type: 'select',
                  source: '${ optionsValue | toJson }',
                },
                {
                  name: 'trueValue',
                  visibleOn: "${ optionsType === '2' }",
                  label: '真值',
                  type: 'select',
                  source:
                    '/admin/data/dict/value/list?datasourceId=${datasourceId}&typeCode=${optionsValue}',
                },

                {
                  name: 'falseValue',
                  visibleOn: "${ optionsType === '1' }",
                  label: '假值',
                  type: 'select',
                  source: '${ optionsValue | toJson }',
                },
                {
                  name: 'falseValue',
                  visibleOn: "${ optionsType === '2' }",
                  label: '假值',
                  type: 'select',
                  source:
                    '/admin/data/dict/value/list?datasourceId=${datasourceId}&typeCode=${optionsValue}',
                },
              ],
              show(row) {
                return ['table', 'query', 'add', 'edit'].includes(row.feature)
              },
            },
            {
              type: 'group',
              visibleOn: "${ formType === 'on_off' && type === 'on_off' }",
              body: [
                {
                  name: 'trueValue',
                  label: '真值',
                  type: 'input-text',
                  value: '1',
                },
                {
                  name: 'falseValue',
                  label: '假值',
                  type: 'input-text',
                  value: '0',
                },
              ],
              show(row) {
                return ['table', 'query', 'add', 'edit'].includes(row.feature)
              },
            },
            {
              type: 'group',
              visibleOn: "${ formType === 'on_off' }",
              body: [
                {
                  name: 'onText',
                  label: '开启名称',
                  type: 'input-text',
                  value: '开启',
                },
                {
                  name: 'offText',
                  label: '关闭名称',
                  type: 'input-text',
                  value: '关闭',
                },
              ],
            },
          ]
            .filter((item) => {
              if (item.show) return item.show({ feature })
              return true
            })
            .map(({ show, ...rest }) => rest),
        },
        show(row) {
          return ['table', 'query', 'add', 'edit', 'detail'].includes(row.feature)
        },
      },
    ]
    return comboItems
  }

  return [schema]
}

function createLayoutFormItem(
  useLayoutField: string,
  colLengthField: string,
  formModeField: string,
  labelWidthField: string,
  config: LayoutFormItemConfig = {}
) {
  const { containerType } = config
  const mode = containerType === 'panelBody' ? 'normal' : 'horizontal'
  const size = 'sm'
  let result = [
    {
      type: 'switch',
      name: useLayoutField,
      label: '是否使用布局',
      mode,
      value: config.useLayout,
    },
    {
      type: 'button-group-select',
      mode,
      name: colLengthField,
      label: '每行列数',
      visibleOn: '${ ' + useLayoutField + ' }',
      value: config.colLength || 3,
      size,
      options: [
        { label: '2列', value: '2' },
        { label: '3列', value: '3' },
        { label: '4列', value: '4' },
        { label: '6列', value: '6' },
      ],
    },
    {
      label: '标签位置',
      mode,
      name: formModeField,
      type: 'button-group-select',
      value: 'normal',
      size,
      options: [
        { label: '上方', value: 'normal' },
        { label: '左侧', value: 'horizontal' },
      ],
    },
    {
      label: '标签宽度(px)',
      mode,
      name: labelWidthField,
      type: 'input-number',
      value: 120,
      visibleOn: '${ ' + formModeField + "=='horizontal' }",
    },
  ]

  if (containerType === 'panelBody') {
    result = result.map((item) => {
      return {
        ...item,
        onChange(value, oldValue, model, form) {
          this.handlePanelBodyFormChange(value, oldValue, model, form)
        },
      }
    })
  }
  return result
}

function createLayoutEFormItem(
  brderColor: string,
  labelBackGroundColor: string,
  labelfontColor: string,
  colLengthField: string,
  labelWidth: number | string,
  contentWidth: number | string,
  config: LayoutFormItemConfig = {}
) {
  const { containerType } = config
  const mode = 'inline'
  const size = 'sm'
  const width = 90
  let result = [
    {
      type: 'input-color',
      name: brderColor,
      label: '边框颜色',
      mode,
      value: '#d9d9d9',
      labelWidth: width,
    },
    {
      type: 'input-color',
      name: labelBackGroundColor,
      label: '标签背景颜色',
      mode,
      value: 'aliceblue',
      labelWidth: width,
    },
    {
      type: 'input-color',
      name: labelfontColor,
      label: '标签文字颜色',
      mode,
      value: '#666666',
      labelWidth: width,
    },

    {
      type: 'button-group-select',
      mode,
      name: colLengthField,
      label: '每行列数',
      value: 3,
      size,
      options: [
        { label: '1列', value: '1' },
        { label: '2列', value: '2' },
        { label: '3列', value: '3' },
        { label: '4列', value: '4' },
      ],
      labelWidth: width,
    },
    {
      type: 'input-text',
      name: labelWidth,
      label: '标签固定宽度',
      placeholder: '自适应宽度可不填',
      value: '',
      labelWidth: width,
      mode,
      size: 'md',
    },
    {
      type: 'input-text',
      name: contentWidth,
      label: '内容固定宽度',
      placeholder: '自适应宽度可不填',
      value: '',
      labelWidth: width,
      mode,
      size: 'md',
    },
  ]

  // console.log(result);
  return result
}

/**
 * 遍历fields列表，仅保留非系统字段（也就是业务字段）
 * @param {*} fields
 * @returns
 */
const onlyNonSys = (fields) => {
  if (TYPE_UTIL.isArray(fields)) {
    return fields.filter(filter__retainNonSys)
  }
  return
}

/**
 * 对原始嵌套数据的统一处理
 * 1) 隐藏不要的字段
 * 2) 给出默认显示隐藏
 * 3) 排序
 * @param {*} fields
 * @returns
 */
const formatBasicNestedData = (fields) => {
  const pipe = new FieldListPipe()
  if (TYPE_UTIL.isArray(fields)) {
    const allFields = pipe.hideBasicSysFields(fields)

    return pipe
      .hideFieldSysProps(allFields)
      .map((item) => {
        return {
          ...item,
          // visible: item.isSys === "N" && !item.extraCfg.relType, // 非系统字段且非关联字段 显示
          visible: false,
        }
      })
      .sort(sort__nonSysFirst)
  }
  return
}
const formatOptions = (fields) => {
  if (TYPE_UTIL.isArray(fields)) {
    const pipe = new FieldListPipe()
    const temp = fields
      .sort(sort__nonSysFirst)
      .filter((item) => {
        return !item.value.startsWith('children____')
      })
      .map((item) => {
        return {
          label: item.label,
          value: item.value,
        }
      })
    return pipe.hideBasicSysFields4Options(temp)
  }
  return
}
/**
 * 递归处理嵌套数据，仅保留业务字段
 */
const recurseOnlyNonSys = (array) => {
  return onlyNonSys(array).map((item) => {
    const { extraCfg, showNameOptions, ...rest } = item
    if (extraCfg.relType) {
      const result = { ...rest }
      if (showNameOptions) {
        result.showNameOptions = onlyNonSys(showNameOptions)
      }
      result.extraCfg = {
        ...extraCfg,
        subFields: recurseOnlyNonSys(extraCfg.subFields),
      }
      return result
    }
    return item
  })
}

const recurseNonSysVisible = (array) => {
  return formatBasicNestedData(array).map((item) => {
    const { extraCfg, showNameOptions, ...rest } = item
    if (extraCfg.relType) {
      const result = { ...rest }
      if (showNameOptions) {
        result.showNameOptions = formatOptions(showNameOptions)
      }
      result.extraCfg = {
        ...extraCfg,
        subFields: recurseNonSysVisible(extraCfg.subFields),
      }
      return result
    }
    return item
  })
}

/**
 * 生成ModelCRUD表单
 * @param {*} list
 * @param {{type}} options type默认是crud，表示生成crud的引导表单；为form时，生成model-form引导表单
 * @returns
 */
export const genModelScaffoldFormSchema = (
  rootNode,
  { type, containerType = 'form' }: { type: string; containerType: FormContainerType }
) => {
  rootNode.fields.sort(sort__nonSysFirst)
  const allFields = recurseNonSysVisible(rootNode.fields)

  const nonSysFields = recurseOnlyNonSys(allFields)

  /**
   * 设置formType
   * @param {object} item
   * @param {string} formType
   * @returns {object}
   */
  const setFormType = (item, formType) => {
    const { extraCfg } = item
    return {
      ...item,
      extraCfg: {
        ...extraCfg,
        formType,
      },
    }
  }
  /**
   * 数据特殊化处理
   * @param {object[]} formItems 字段列表
   * @param {string} type 类型
   * @return {object[]}
   */
  const specialize = (formItems, type) => {
    const loop = (array, ancestors = []) => {
      return array.map((item) => {
        const { extraCfg = {} } = item
        const { relType } = extraCfg
        // table
        if (type === 'table') {
          if (['pickerOne', 'subFormOne'].includes(relType)) {
            item = setFormType(item, '__table')
            item.extraCfg.subFields = loop(item.extraCfg.subFields, [...ancestors, item])
          } else if (relType === 'subFormMany') {
            return setFormType(item, '__unavailable')
          }
        }
        // query
        else if (type === 'query') {
          item = { ...item, visible: false }
          if (relType === 'subFormMany') {
            return setFormType(item, '__unavailable')
          } else if (['pickerOne', 'subFormOne'].includes(relType)) {
            return setFormType(item, '__table')
          }
        }
        // add
        else if (type === 'add' || type === 'edit') {
          if (relType === 'pickerOne' || relType === 'subFormOne') {
            // 已经有picker列表选择器，则下面所有层级的picker合并
            if (ancestors.find((elem) => elem.extraCfg.relType === 'pickerOne')) {
              item = setFormType(item, '__table')

              for (let key in item.extraCfg) {
                if (key.startsWith('relType') && !key.startsWith('relTypeLabel')) {
                  item.extraCfg[key] = 'pickerOne'
                }
              }
              item.extraCfg.subFields.forEach((item) => {
                item.visible = false
              })
            }
            item = {
              ...item,
              extraCfg: {
                ...item.extraCfg,
                subFields: loop(item.extraCfg.subFields, [...ancestors, item]),
              },
            }
          }
        }
        // edit
        // else if (type === "edit") {
        // }
        // detail
        else if (type === 'detail') {
          if (relType === 'pickerOne' || relType === 'subFormOne') {
            // 子表与主表连接展示
            item = setFormType(item, '__table')
            item.extraCfg.subFields = loop(item.extraCfg.subFields, [...ancestors, item])
          }
        }
        // import
        else if (type === 'import') {
          if (relType === 'pickerOne') {
            // 子表与主表连接展示
            return setFormType(item, '__table')
          } else if (relType === 'subFormMany') {
            // 不可用
            return setFormType(item, '__unavailable')
          }
        }
        // export
        else if (type === 'export') {
          if (['pickerOne', 'subFormOne', 'subFormMany'].includes(relType)) {
            // 子表与主表连接展示
            return setFormType(item, '__table')
          }
        }

        return item
      })
    }
    return loop(formItems)
  }

  const __tableItems = specialize(cloneDeep(allFields), 'table')
  const __queryFormItems = specialize(cloneDeep(allFields), 'query')
  const __addFormItems = specialize(cloneDeep(allFields), 'add')
  const __editFormItems = specialize(cloneDeep(allFields), 'edit')
  const __detailFormItems = specialize(cloneDeep(allFields), 'detail')
  // console.log("detail", __detailFormItems);
  // const __batchEditFormItems = specialize(cloneDeep(allFields), "edit"); // 批量更新
  const __exportItems = specialize(cloneDeep(allFields), 'export')
  const __importItems = specialize(cloneDeep(nonSysFields), 'import')

  const tabItemMapper = {
    table: {
      title: '列表',
      tab: [
        ...createFieldListFormItem({
          name: '__tableItems',
          value: __tableItems,
          feature: 'table',
          containerType,
        }),
      ],
    },
    query: {
      title: '条件查询',
      visibleOn: '${ CONTAINS(features,"query") }',
      tab: [
        ...createLayoutFormItem(
          'queryUseLayout',
          'queryColLength',
          'queryFormMode',
          'queryLabelWidth',
          {
            useLayout: true,
            colLength: 3,
            containerType,
          }
        ),
        ...createFieldListFormItem({
          name: '__queryFormItems',
          value: __queryFormItems,
          feature: 'query',
          containerType,
          // layout: {
          //   useLayout: 'queryUseLayout',
          //   colLength: 'queryColLength',
          //   formMode: 'queryFormMode',
          //   labelWidth: 'queryLabelWidth',
          //   config: {
          //     useLayout: true,
          //     colLength: 3,
          //     containerType
          //   }
          // }
        }),
      ],
    },
    add: {
      title: '新增',
      visibleOn: '${ CONTAINS(features,"add") }',
      tab: [
        ...createLayoutFormItem(
          'addFormUseLayout',
          'addFormColLength',
          'addFormMode',
          'addLabelWidth',
          {
            useLayout: false,
            colLength: 2,
            containerType,
          }
        ),
        ...createFieldListFormItem({
          name: '__addFormItems',
          value: __addFormItems,
          feature: 'add',
          containerType,
          // layout: {
          //   useLayout: 'addFormUseLayout',
          //   colLength: 'addFormColLength',
          //   formMode: 'addFormMode',
          //   labelWidth: 'addLabelWidth',
          //   config: {
          //     useLayout: false,
          //     colLength: 2,
          //     containerType
          //   }
          // }
        }),
      ],
    },
    edit: {
      title: '编辑',
      visibleOn: '${ CONTAINS(features,"edit") }',
      tab: [
        ...createLayoutFormItem(
          'editFormUseLayout',
          'editFormColLength',
          'editFormMode',
          'editLabelWidth',
          {
            useLayout: false,
            colLength: 2,
            containerType,
          }
        ),
        {
          label: '默认静态展示',
          type: 'switch',
          name: 'isStatic',
          mode: 'horizontal',
        },
        {
          label: '边框',
          type: 'switch',
          name: 'bordered',
          mode: 'horizontal',
        },
        ...createFieldListFormItem({
          name: '__editFormItems',
          value: __editFormItems,
          feature: 'edit',
          containerType,
          // layout: {
          //   useLayout: 'editFormUseLayout',
          //   colLength: 'editFormColLength',
          //   formMode: 'editFormMode',
          //   labelWidth: 'editLabelWidth',
          //   config: {
          //     useLayout: false,
          //     colLength: 2,
          //     containerType
          //   }
          // }
        }),
      ],
    },
    detail: {
      title: '详情',
      visibleOn: '${ CONTAINS(features,"detail") }',
      tab: [
        ...createLayoutFormItem(
          'detailUseLayout',
          'detailColLength',
          'detailFormMode',
          'detailLabelWidth',
          {
            useLayout: false,
            colLength: 2,
            containerType,
          }
        ),
        ...createFieldListFormItem({
          name: '__detailFormItems',
          value: __detailFormItems,
          feature: 'detail',
          containerType,
          // layout: {
          //   useLayout: 'detailUseLayout',
          //   colLength: 'detailColLength',
          //   formMode: 'detailFormMode',
          //   labelWidth: 'detailLabelWidth',
          //   config: {
          //     useLayout: false,
          //     colLength: 2,
          //     containerType
          //   }
          // }
        }),
      ],
    },
    batchEdit: {
      title: '批量更新',
      visibleOn: '${ CONTAINS(features,"batchEdit") }',
      tab: [
        ...createFieldListFormItem({
          name: '__batchEditFormItems',
          value: __editFormItems,
          feature: 'batchEdit',
          containerType,
          // layout: {
          //   useLayout: 'batchEditFormUseLayout',
          //   colLength: 'batchEditFormColLength',
          //   formMode: 'batchEditFormMode',
          //   labelWidth: 'batchEditLabelWidth',
          //   config: {
          //     useLayout: false,
          //     colLength: 2,
          //     containerType
          //   }
          // }
        }),
      ],
    },
    Eform: {
      title: '电子表单',
      visibleOn: '${ CONTAINS(features,"Eform") }',
      tab: [
        ...createLayoutEFormItem(
          'brderColor',
          'labelBackGroundColor',
          'labelfontColor',
          'colLengthField',
          'labelWidth',
          'contentWidth',
          {
            useLayout: false,
            colLength: 2,
            containerType,
          }
        ),
        ...createFieldListFormItem({
          name: '__editFormItems',
          value: __editFormItems,
          feature: 'edit',
          containerType,
        }),
      ],
    },
    Pform: {
      title: '属性表单',
      visibleOn: '${ CONTAINS(features,"Pform") }',
      tab: [
        ...createLayoutEFormItem(
          'brderColor',
          'labelBackGroundColor',
          'labelfontColor',
          'colLengthField',
          'labelWidth',
          'contentWidth',
          {
            useLayout: false,
            colLength: 2,
            containerType,
          }
        ),
        ...createFieldListFormItem({
          name: '__editFormItems',
          value: __editFormItems,
          feature: 'edit',
          containerType,
        }),
      ],
    },
    import: {
      title: '导入',
      visibleOn: '${ CONTAINS(features,"import") }',
      tab: [
        ...createFieldListFormItem({
          name: '__importItems',
          value: __importItems,
          feature: 'import',
          containerType,
        }),
      ],
    },
    export: {
      title: '导出',
      visibleOn: '${ CONTAINS(features,"export") }',
      tab: [
        ...createFieldListFormItem({
          name: '__exportItems',
          value: __exportItems,
          feature: 'export',
          containerType,
        }),
      ],
    },
  }
  if (type === 'form') {
    return {
      data: {
        __addFormItems,
        __editFormItems,
        __detailFormItems,
        formTypeMapper: FormTypeList.reduce((acc, ele) => {
          acc[ele.value] = ele.label
          return acc
        }, {}),
      },
      schema: [
        {
          type: 'tabs',
          tabsMode: 'vertical',
          tabs: ['add', 'edit', 'detail', 'Eform', 'Pform'].map((item) => tabItemMapper[item]),
        },
      ],
    }
  }

  const createContainerSchema = (type: FormContainerType) => {
    const contents = ['table', 'query', 'add', 'edit', 'detail', 'import', 'export'].map(
      (item) => tabItemMapper[item]
    )

    if (type === 'panelBody') {
      return {
        type: 'collapse-group',
        enableFieldSetStyle: false,
        className: 'my-collapse-group',
        expandIconPosition: 'right',
        activeKey: ['1'],
        body: contents.map(({ title, visibleOn, tab }, i) => {
          return {
            type: 'collapse',
            key: `${i + 1}`,
            visibleOn,
            header: title,
            body: tab,
          }
        }),
      }
    } else if (type === 'form') {
      return {
        type: 'tabs',
        tabsMode: 'vertical',
        mountOnEnter: true,
        tabs: contents,
      }
    }
  }
  return {
    data: {
      __tableItems,
      __detailFormItems,
      __exportItems,
      __importItems,
      __queryFormItems,
      __addFormItems,
      __editFormItems,
      formTypeMapper: FormTypeList.reduce((acc, ele) => {
        acc[ele.value] = ele.label
        return acc
      }, {}),
    },
    schema: createContainerSchema(containerType),
  }
}

/**
 * scaffold form 数据源和实体表单项schema
 */
export const getDataSourceSchema = (
  cfg: { componentId?: string; formType?: 'edit' | 'add' } = {}
) => {
  const { componentId, formType } = cfg
  return {
    type: 'group',
    mode: 'inline',
    body: [
      {
        label: '数据源',
        type: 'select',
        name: 'datasourceId',
        placeholder: '请选择数据源',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/data/datasource/list',
          responseData: {
            options: '${items|pick:label~name,value~id}',
          },
        },
        disabled: formType === 'edit',
      },
      {
        label: '实体',
        type: 'select',
        name: 'entity',
        placeholder: '请选择实体',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/data/model/entities?datasourceId=${datasourceId}',
          responseData: {
            options: '${ items|pick:label~name,value~id }',
          },
        },
        searchable: true,
        visibleOn: '${datasourceId}',
        disabled: formType === 'edit',
        onEvent: {
          change: {
            actions: [
              {
                actionType: 'rebuild',
                componentId,
                args: {
                  entityId: '${event.data.value}',
                },
              },
            ],
          },
        },
      },
    ],
  }
}

/**
 * 递归处理结构树，将字段列表转换成id的map，同时返回扁平结构数据
 * @param {*} items
 * @returns
 */
export const getIdMap = (items, options: { noSubFormMany?: boolean } = {}) => {
  const idMapper = {}
  const plateItems = []
  const { noSubFormMany } = options
  const loop = (array) => {
    array.forEach((item) => {
      const relType = item?.extraCfg?.relType
      if (item.visible) {
        idMapper[item.id] = item.tableName + '.' + item.fieldName
        // 按需更新
        if (item.extraCfg.selfUpdate) {
          idMapper[item.id] = false
        }
        if (!relType) {
          // 普通字段
          plateItems.push(item)
        } else if (relType === 'pickerOne') {
          if (item?.extraCfg?.subFields) {
            loop(item.extraCfg.subFields)
          }
        } else if (relType === 'subFormOne') {
          if (item?.extraCfg?.subFields) {
            loop(item.extraCfg.subFields)
          }
        } else if (relType === 'subFormMany') {
          if (item?.extraCfg?.subFields && !noSubFormMany) {
            loop(item.extraCfg.subFields)
          }
          if (noSubFormMany) {
            idMapper[item.id] = false
          }
        } else {
          console.log('待处理=>', item)
        }
      } else if (item.extraCfg.relType === 'pickerOne') {
        idMapper[item.id] = item.tableName + '.' + item.fieldName
      }
    })
  }
  loop(items)
  return {
    idMapper,
    plateItems,
  }
}

/**
 * 递归处理，生成参数中children结构，仅保留用户选中的字段
 * @param {*} list
 * @param {*} mapper
 * @param {boolean} withDeepId 是否深层查询id
 * @returns
 */
export const loopOnlyVisible = (list, mapper, withDeepId) => {
  const loop = (list) => {
    return list
      .filter((item) => {
        if (!mapper[item.id]) {
          return false
        }
        if (item.relType) {
          // 处理关联关系的字段
          if (item.relType === 'OneToMany') return true
          if (item.relType === 'OnetoOne') {
            return item.id.startsWith('children____')
          }
          if (item.relType === 'ManyToOne') {
            return false
          }
        }
        return true
      })
      .map((item) => {
        const { entityId, tableName, tableNameLabel, fields, relType, children, id } = item
        const result: QueryEntity = {
          entityId,
          tableName,
          tableNameLabel,
          showName: tableNameLabel,
          relType,
          columns: fields
            .filter(
              (item) =>
                !item.id.startsWith('children____') &&
                (mapper[item.id] || (withDeepId && item.fieldName === 'id'))
            )
            .map(mapModelFieldToPostBodyColumn),
        }
        if (Array.isArray(children) && children.length > 0) {
          result.children = loop(children)
        }
        return result
      })
  }
  const result = loop(list).filter((item) => item.columns && item.columns.length > 0)
  return result
}
