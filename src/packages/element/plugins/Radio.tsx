import { BasePlugin, registerEditorPlugin, RendererPluginAction } from 'amis-editor'
import { defaultValue, getSchemaTpl, BaseEventContext, RendererPluginEvent } from 'amis-editor-core'
import type { Schema } from 'amis'
import { ValidatorTag } from 'amis-editor/lib/validator'
import { getEventControlConfig } from 'amis-editor/lib/renderer/event-control/helper'

export default class CustomRadiosPlugin extends BasePlugin {
  static id = 'CustomRadiosPlugin'
  static scene = ['layout']
  rendererName = 'el-radios'
  $schema = '/schemas/UnkownSchema.json'
  name = '过滤器EL'
  tags = ['表单项']
  icon = 'fa fa-dot-circle-o'
  pluginIcon = 'radios-plugin'
  description = '通过 options 配置选项，可通过 source 拉取选项'
  order = -1000

  filterRadioSchema = {
    type: 'el-radios',
    label: '过滤器风格',
    name: 'radios',
    hasAll: true,
    styleMode: 'filter',
    options: [
      {
        label: 'A',
        value: 'A',
      },

      {
        label: 'B',
        value: 'B',
      },
    ],
  }

  scaffold = {
    type: 'form',
    mode: 'horizontal',
    wrapWithPanel: false,
    body: [
      this.filterRadioSchema,
      {
        ...this.filterRadioSchema,
        styleMode: 'default',
        label: '单选框风格',
      },
    ],
  }
  isBaseComponent = true
  previewSchema: any = {
    type: 'form',
    className: 'text-left',
    mode: 'horizontal',
    wrapWithPanel: false,
    body: [
      {
        ...this.scaffold,
        value: '',
      },
    ],
  }
  notRenderFormZone = true
  panelTitle = '单选框EL'
  panelJustify = true
  events: RendererPluginEvent[] = [
    {
      eventName: 'change',
      eventLabel: '值变化',
      description: '选中值变化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              properties: {
                value: {
                  type: 'string',
                  title: '选中的值',
                },
                selectedItems: {
                  type: 'object',
                  title: '选中的项',
                },
                items: {
                  type: 'array',
                  title: '选项列表',
                },
              },
            },
          },
        },
      ],
    },
  ]
  actions: RendererPluginAction[] = [
    {
      actionType: 'clear',
      actionLabel: '清空',
      description: '清除选中值',
    },
    {
      actionType: 'reset',
      actionLabel: '重置',
      description: '将值重置为resetValue，若没有配置resetValue，则清空',
    },
    {
      actionType: 'reload',
      actionLabel: '重新加载',
      description: '触发组件数据刷新并重新渲染',
    },
    {
      actionType: 'setValue',
      actionLabel: '赋值',
      description: '触发组件数据更新',
    },
  ]

  panelBodyCreator = (context: BaseEventContext) => {
    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本',
            body: [
              getSchemaTpl('layout:originPosition', { value: 'left-top' }),
              getSchemaTpl('formItemName', {
                required: true,
              }),
              getSchemaTpl('label'),
              {
                name: 'styleMode',
                type: 'button-group-select',
                label: '样式风格',
                options: [
                  { value: 'filter', label: '过滤器' },
                  { value: 'default', label: '单选框' },
                ],
                value: 'filter',
                size: 'sm',
              },
              getSchemaTpl('valueFormula', {
                rendererSchema: (schema: Schema) => schema,
                useSelectMode: true, // 改用 Select 设置模式
                visibleOn: 'this.options && this.options.length > 0',
              }),
              // getSchemaTpl('autoFill')
              getSchemaTpl('labelRemark'),
              getSchemaTpl('remark'),
              getSchemaTpl('autoFillApi', {
                trigger: 'change',
              }),
            ],
          },
          {
            title: '选项',
            body: [
              getSchemaTpl('optionControlV2'),
              getSchemaTpl('selectFirst'),
              {
                name: 'hasAll',
                // label: '可选全部',
                label: {
                  type: 'tooltip-wrapper',
                  tooltipTheme: 'dark',
                  body: '可选全部',
                  className: 'ae-formItemControl-label-tip',
                  placement: 'top',
                  tooltip: '自动加上全部选项',
                  tooltipStyle: { fontSize: '12px' },
                },
                type: 'switch',
                mode: 'horizontal',
                inputClassName: 'is-inline ',
                defaultTrue: true,
                horizontal: { justify: true, left: 8, right: 4 },
                value: true,
              },
              {
                type: 'input-text',
                name: 'allLabel',
                label: '全部标签',
                value: '不限',
                visibleOn: '${ hasAll }',
              },
              {
                type: 'input-text',
                name: 'allValue',
                label: '全部值',
                value: '',
                placeholder: '默认为空字符串',
                visibleOn: '${ hasAll }',
              },
            ],
          },
          getSchemaTpl('status', { isFormItem: true }),
          getSchemaTpl('validation', { tag: ValidatorTag.MultiSelect }),
        ]),
      },
      {
        title: '外观',
        body: [
          getSchemaTpl('collapseGroup', [
            getSchemaTpl('style:formItem', {
              renderer: context.info.renderer,
              schema: [
                getSchemaTpl('switch', {
                  label: '一行选项显示',
                  name: 'inline',
                  hiddenOn: 'data.mode === "inline"',
                  pipeIn: defaultValue(true),
                }),
                {
                  label: '每行选项个数',
                  name: 'columnsCount',
                  hiddenOn: 'data.mode === "inline" || data.inline !== false',
                  type: 'input-range',
                  min: 1,
                  max: 6,
                  pipeIn: defaultValue(1),
                },
              ],
            }),
            getSchemaTpl('style:classNames', {
              schema: [
                getSchemaTpl('className', {
                  label: '单个选项',
                  name: 'itemClassName',
                }),
              ],
            }),
          ]),
        ],
      },
      {
        title: '事件',
        className: 'p-none',
        body: [
          getSchemaTpl('eventControl', {
            name: 'onEvent',
            ...getEventControlConfig(this.manager, context),
          }),
        ],
      },
    ])
  }
}

registerEditorPlugin(CustomRadiosPlugin)
