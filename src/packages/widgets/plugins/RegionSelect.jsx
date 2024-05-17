import { getDataSourceSchema } from '@/packages/utils/model-util'
import { guid } from 'amis-core'
import { BasePlugin, registerEditorPlugin } from 'amis-editor'

export class RegionSelectPlugin extends BasePlugin {
  rendererName = 'select'
  $schema = '/schemas/UnkownSchema.json'
  name = '区域级联'
  description = '当业务表中，区域分“省、市、区”三个字段存储时，使用该选择器'
  isBaseComponent = true
  tags = ['表单项']
  icon = 'fa fa-city'
  pluginIcon = 'icon-table-plugin'
  order = -100

  scaffold = {
    type: 'group',
    mode: 'inline',
    body: [
      {
        type: 'select',
        name: 'province',
        source: {
          method: 'post',
          url: '/admin/entity/data/page?current=1&size=10000',
          data: {
            entityId: '952ef998bc4541979843a473075a2632',
            columns: [
              ['t_area', 'code', '编码'],
              ['t_area', 'name', '名称'],
            ],
            criteria: [
              {
                fieldName: 't_area.type',
                type: 'eq',
                startValue: 'P',
                endValue: '',
              },
              {
                fieldName: 't_area.parent_sn',
                type: 'eq',
                startValue: '0',
                endValue: '',
              },
            ],
          },
          responseData: {
            options: "${records|pick:label~'t_area.name',value~'t_area.code'}",
          },
        },
      },
      {
        type: 'select',
        name: 'city',
        source: {
          method: 'post',
          url: '/admin/entity/data/page?current=1&size=10000',
          data: {
            entityId: '952ef998bc4541979843a473075a2632',
            columns: [
              ['t_area', 'code', '编码'],
              ['t_area', 'name', '名称'],
            ],
            criteria: [
              {
                fieldName: 't_area.type',
                type: 'eq',
                startValue: 'C',
                endValue: '',
              },
              {
                fieldName: 't_area.parent_sn',
                type: 'eq',
                startValue: '${province}',
                endValue: '',
              },
            ],
          },
          responseData: {
            options: "${records|pick:label~'t_area.name',value~'t_area.code'}",
          },
        },
        visibleOn: '${province}',
      },
      {
        type: 'select',
        name: 'district',
        source: {
          method: 'post',
          url: '/admin/entity/data/page?current=1&size=10000',
          data: {
            entityId: '952ef998bc4541979843a473075a2632',
            columns: [
              ['t_area', 'code', '编码'],
              ['t_area', 'name', '名称'],
            ],
            page: { current: 1, size: 10000 },
            criteria: [
              {
                fieldName: 't_area.type',
                type: 'eq',
                startValue: 'D',
                endValue: '',
              },
              {
                fieldName: 't_area.parent_sn',
                type: 'eq',
                startValue: '${city}',
                endValue: '',
              },
            ],
          },
          responseData: {
            options: "${records|pick:label~'t_area.name',value~'t_area.code'}",
          },
        },
        visibleOn: '${city}',
      },
    ],
  }
  get scaffoldForm() {
    return {
      title: '生成级联区域选择框',
      body: [
        getDataSourceSchema(),
        {
          type: 'service',
          schemaApi: {
            url: '/admin/data/model/entity/${entity}?usePage=regionSelect',
            method: 'get',
            responseData: {
              body: '${schema}',
            },
          },
          visibleOn: '${entity}',
        },
      ],
      pipeOut: (value) => {
        console.log(value)
        const {
          tableName,
          provinceField,
          cityField,
          districtField,
          separator = '.',
          datasourceId,
        } = value
        const province = [tableName, provinceField].join(separator)
        const city = [tableName, cityField].join(separator)
        const district = [tableName, districtField].join(separator)

        // 格式化数据
        const responseData = {
          options: '${items|pick:label~name,value~code}',
        }
        const cityId = 'u:' + guid()
        const districtId = 'u:' + guid()
        return {
          type: 'group',
          mode: 'inline',
          body: [
            {
              type: 'select',
              name: province,
              clearable: true,
              source: {
                method: 'get',
                url: '/admin/data/area/list?datasourceId=' + datasourceId + '&type=P&parentSn=0',
                responseData,
              },
              onEvent: {
                change: {
                  actions: [
                    {
                      actionType: 'setValue',
                      componentId: districtId,
                      args: {
                        value: '',
                      },
                    },
                    {
                      actionType: 'setValue',
                      componentId: cityId,
                      args: {
                        value: '',
                      },
                    },
                  ],
                },
              },
            },
            {
              type: 'select',
              name: city,
              id: cityId,
              clearable: true,
              source: {
                method: 'get',
                url:
                  '/admin/data/area/list?datasourceId=' +
                  datasourceId +
                  '&type=C&parentSn=' +
                  '${' +
                  province +
                  '}',
                responseData,
              },
              onEvent: {
                change: {
                  actions: [
                    {
                      actionType: 'setValue',
                      componentId: districtId,
                      args: {
                        value: '',
                      },
                    },
                  ],
                },
              },
              visibleOn: '${' + province + '}',
            },
            {
              type: 'select',
              name: district,
              clearable: true,
              id: districtId,
              source: {
                method: 'get',
                url:
                  '/admin/data/area/list?datasourceId=' +
                  datasourceId +
                  '&type=D&parentSn=' +
                  '${' +
                  city +
                  '}',
                responseData,
              },
              visibleOn: '${' + city + '}',
            },
          ],
        }
      },
    }
  }
}

registerEditorPlugin(RegionSelectPlugin)
