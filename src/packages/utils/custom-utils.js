import { getTid } from '@/utils/index.js'
const tid = getTid()
console.log(tid)
/**
 * scaffold form 数据源配置
 */
export const getDataSourceSchema = () => {
  return {
    type: 'group',
    mode: 'inline',
    body: [
      {
        label: '租户',
        type: 'select',
        name: 'tenantId',
        placeholder: '请选择数据源',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/tenant/page',
          responseData: {
            options: '${records|pick:label~name,value~id}',
          },
        },
        change: (value, selectedItems) => {
          console.log(value, selectedItems)
        },
      },
      {
        label: '应用',
        type: 'select',
        name: 'appId',
        placeholder: '请选择实体',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/tenant/app/basic/page?tenantId=${tenantId}',
          responseData: {
            options: '${ records|pick:label~name,value~id }',
          },
        },
        visibleOn: '${tenantId}',
      },
      {
        label: '组件',
        type: 'select',
        name: 'componentId',
        placeholder: '请选择组件',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/tenant/app/page/tree?appId=${appId}&tenantId=${tenantId}',
          responseData: {
            options: '${items|pick:label~name,value~id }',
          },
        },
        change: (value) => {
          console.log(value)
        },
        visibleOn: '${appId}',
      },
      {
        type: 'service',
        api: {
          url: '/admin/tenant/app/page/${componentId}?appId=${appId}&tenantId=${tenantId}',
          method: 'get',
        },
        visibleOn: '${componentId}',
      },
    ],
  }
}
// 自定义组件配置

export const getCustomSchema = () => {
  return {
    type: 'group',
    mode: 'inline',
    body: [
      {
        label: '组件类型',
        type: 'select',
        name: 'type',
        placeholder: '请选择数据源',
        inputClassName: 'w-40',
        options: [
          {
            label: '业务组件',
            value: 'business',
          },
          {
            label: '组件模版',
            value: 'template',
          },
        ],
      },
      {
        label: '分类',
        type: 'select',
        name: 'categoryId',
        placeholder: '请选择分类',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/component/category/list?type=${type}&level=tenant',
          responseData: {
            options: '${ items|pick:label~name,value~id }',
          },
        },
        visibleOn: '${type}',
      },
      {
        label: '组件',
        type: 'select',
        name: 'designJson',
        placeholder: '请选择组件',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/component/design/page?type=${type}&categoryId=${categoryId}&level=tenant',
          responseData: {
            options: '${records|pick:label~name,value~designJson }',
          },
        },
        change: (value) => {
          console.log(value)
        },
        visibleOn: '${categoryId}',
      },
    ],
  }
}

export const getAllCustomSchema = () => {
  return {
    type: 'group',
    mode: 'inline',
    body: [
      {
        label: '组件类型',
        type: 'select',
        name: 'type',
        placeholder: '请选择数据源',
        inputClassName: 'w-40',
        options: [
          {
            label: '业务组件',
            value: 'business',
          },
          {
            label: '组件模版',
            value: 'template',
          },
        ],
      },
      {
        label: '分类',
        type: 'select',
        name: 'categoryId',
        placeholder: '请选择分类',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/component/category/list?type=${type}&level=platform',
          responseData: {
            options: '${ items|pick:label~name,value~id }',
          },
        },
        visibleOn: '${type}',
      },
      {
        label: '组件',
        type: 'select',
        name: 'designJson',
        placeholder: '请选择组件',
        inputClassName: 'w-40',
        source: {
          method: 'get',
          url: '/admin/component/design/page?type=${type}&categoryId=${categoryId}&level=platform',
          responseData: {
            options: '${records|pick:label~name,value~designJson }',
          },
        },
        change: (value) => {
          console.log(value)
        },
        visibleOn: '${categoryId}',
      },
    ],
  }
}
