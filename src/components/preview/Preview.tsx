import React, { useState, useEffect } from 'react'
import { AmisRenderer } from '@/packages'
import { fetcherFactory } from '@/packages/utils/amis'
import axios from '@/plugins/axios'
import { useStore } from '@/store/root'
import { Button, Modal, Form, Input, Row, Col } from 'antd'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import '../my-editor.scss'
import MyEditor from '../MyEditor'


export default function Preview() {
  const fetcher = fetcherFactory(axios)
  const str = sessionStorage.getItem('amisSchema')
  const json = JSON.parse(str)

  const [schema, setSchema] = useState(json)
  // const app = {
  //   type: 'app',
  //   brandName: 'Admin',
  //   logo: '/logo.png',
  //   header: {
  //     type: 'tpl',
  //     inline: false,
  //     className: 'w-full',
  //     tpl: '<div class="flex justify-between"><div>顶部区域左侧</div><div>顶部区域右侧</div></div>',
  //   },
  //   footer: '<div class="p-2 text-center bg-light">底部区域11</div>',
  //   asideBefore: '<div class="p-2 text-center">菜单前面区域</div>',
  //   asideAfter: '<div class="p-2 text-center">菜单后面区域</div>',
  //   pages: [
  //     {
  //       label: '分组1',
  //       children: [
  //         {
  //           label: '父页面',
  //           children: [
  //             {
  //               label: '子页面A',
  //               url: '/preview/pageA',
  //               schema: {
  //                 type: 'page',
  //                 title: 'Page A',
  //                 data: {
  //                   options: [
  //                     {
  //                       label: 'A',
  //                       value: 'a',
  //                     },
  //                     {
  //                       label: 'B',
  //                       value: 'b',
  //                       children: [
  //                         {
  //                           label: 'B-1',
  //                           value: 'b-1',
  //                         },
  //                         {
  //                           label: 'B-2',
  //                           value: 'b-2',
  //                         },
  //                         {
  //                           label: 'B-3',
  //                           value: 'b-3',
  //                         },
  //                       ],
  //                     },
  //                     {
  //                       label: 'C',
  //                       value: 'c',
  //                     },
  //                   ],
  //                 },
  //                 body: {
  //                   type: 'form',
  //                   debug: true,
  //                   mode: 'horizontal',
  //                   body: [
  //                     {
  //                       label: '类型',
  //                       name: 'type',
  //                       type: 'el-cascader',
  //                       source: {
  //                         method: 'get',
  //                         url: '/policy/api/platform/enterprise/lib/industry/list',
  //                         requestAdaptor: '',
  //                         adaptor: '',
  //                         messages: {},
  //                       },
  //                       labelField: 'name',
  //                       valueField: 'id',
  //                       searchable: true,
  //                       clearable: true,
  //                       placeholder: '请选择企业类型',
  //                       size: 'full',
  //                       value: ['02', '022', '0220'],
  //                     },
  //                     {
  //                       label: '经营状态',
  //                       name: 'status',
  //                       type: 'el-radios',
  //                       source: {
  //                         method: 'get',
  //                         url: '/admin/data/dict/value/list?datasourceId=5d82aa177c8140569be586c05aef3faf&typeCode=ENLIB_REGISTER_STATUS',
  //                       },
  //                       searchable: true,
  //                       clearable: true,
  //                       placeholder: '请选择经营状态',
  //                       size: 'full',
  //                       hasAll: true,
  //                       styleMode: 'filter',
  //                     },
  //                   ],
  //                 },
  //               },
  //             },
  //             {
  //               label: '子页面B',
  //               url: '/preview/pageB',
  //               schema: {
  //                 type: 'page',
  //                 title: 'Page B',
  //                 body: [
  //                   {
  //                     type: 'button',
  //                     label: '跳转',
  //                     actionType: 'link',
  //                     link: '/preview/pageA',
  //                   },
  //                 ],
  //               },
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // }
  const app = {
    "type": "page",
    "id": "u:e5e91f4f480d",
    "body": [
      {
        "type": "crud",
        "id": "u:6045c45c9878",
        "api": {
          "url": "/admin-api/system/amis/page?pageNo=${page}&pageSize=${perPage}",
          "method": "get",
          "requestAdaptor": "",
          "adaptor": "",
          "messages": {},
          "data": {
            "&": "$$"
          },
          "responseData": {
            "items": "${ list}",
            "total": "${ total }"
          }
        },
        "filter": {
          "title": "",
          "mode": "normal",
          "body": [
            {
              "type": "grid",
              "id": "u:785d7ffae981",
              "columns": [
                {
                  "md": 3,
                  "body": [
                    {
                      "type": "input-text",
                      "label": "名称",
                      "name": "title",
                      "id": "u:5fe199eb8296",
                      "mode": "horizontal"
                    }
                  ],
                  "id": "u:fa9831111971"
                },
                {
                  "md": 3,
                  "body": [
                    {
                      "type": "select",
                      "label": "状态",
                      "name": "status",
                      "id": "u:94a5c9711356",
                      "multiple": false,
                      "mode": "horizontal",
                      "source": {
                        "url": "/admin-api/system/dict-data/page?dictType=biz_device_status",
                        "method": "get",
                        "requestAdaptor": "",
                        "adaptor": "",
                        "messages": {},
                        "sendOn": "",
                        "responseData": {
                          "items": "${list}"
                        }
                      }
                    }
                  ],
                  "id": "u:6d3ab47af081"
                },
                {
                  "body": [
                    {
                      "type": "input-date",
                      "label": "日期",
                      "name": "createTime",
                      "id": "u:ed512ccfeb37",
                      "mode": "horizontal"
                    }
                  ],
                  "id": "u:6d3ab47af081",
                  "md": 3
                },
                {
                  "body": [
                    {
                      "type": "submit",
                      "level": "primary",
                      "label": "查询",
                      "id": "u:563fe915ea80"
                    },
                    {
                      "type": "reset",
                      "label": "重置",
                      "id": "u:82db2371eb0a",
                      "themeCss": {
                        "className": {
                          "padding-and-margin:default": {
                            "marginLeft": "10px"
                          }
                        }
                      }
                    }
                  ],
                  "id": "u:d35be38c59c8"
                }
              ]
            }
          ],
          "id": "u:99ae269089ad",
          "feat": "Insert",
          "wrapWithPanel": false
        },
        "headerToolbar": [
          {
            "type": "bulk-actions",
            "align": "left"
          },
          {
            "type": "button",
            "label": "新增",
            "actionType": "dialog",
            "target": "name_9445694ef9a8",
            "dialog": {
              "id": "u:37401118da0c",
              "title": "新增",
              "body": [
                {
                  "type": "form",
                  "id": "u:d85bcc5dbdf2",
                  "mode": "horizontal",
                  "title": "新增",
                  "body": [
                    {
                      "label": "名称",
                      "name": "title",
                      "searchType": "like",
                      "type": "input-text",
                      "placeholder": "请输入设备名称",
                      "id": "u:53093a37bc30",
                      "required": true
                    },
                    {
                      "label": "代码json",
                      "name": "amisJson",
                      "searchType": "like",
                      "type": "editor",
                      "placeholder": "请输入设备名称",
                      "id": "u:430622998981",
                      "required": true
                    },
                    {
                      "type": "radios",
                      "label": "状态",
                      "name": "status",
                      "options": [
                        {
                          "label": "已发布",
                          "value": "1"
                        },
                        {
                          "label": "未发布",
                          "value": "2"
                        }
                      ],
                      "id": "u:12c696d88bb1"
                    },
                    
                        {
                          "label": "类型",
                          "name": "type",
                          "type": "radios",
                          "id": "u:12c696d88bb1",
                          "options": [
                            {
                              "label": "页面",
                              "value": "1"
                            },
                            {
                              "label": "组件",
                              "value": "2"
                            },
                            {
                              "label": "模版",
                              "value": "3"
                            },
                          ]
                        }
                  ],
                  "api": {
                    "method": "post",
                    "url": "/admin-api/system/amis/create",
                    "convertKeyToPath": false,
                    "data": {
                      "&": "$$",
                      "amisJson":"${amisJson}"
                    },
                    "requestAdaptor": "",
                    "adaptor": "",
                    "messages": {}
                  },
                  "resetAfterSubmit": true,
                  "wrapWithPanel": false,
                  "feat": "Insert",
                  "dsType": "api",
                  "debug": false,
                  "rules": []
                }
              ],
              "data": {},
              "size": "md",
              "actions": [
                {
                  "type": "button",
                  "actionType": "cancel",
                  "label": "取消",
                  "id": "u:e62bc161624a"
                },
                {
                  "type": "button",
                  "actionType": "confirm",
                  "label": "确定",
                  "primary": true,
                  "id": "u:7710704af93c"
                }
              ]
            },
            "id": "u:cc0be8ade2b7",
            "level": "primary",
            "align": "right"
          }
        ],
        "footerToolbar": [
          {
            "type": "pagination",
            "align": "right"
          },
          {
            "type": "statistics",
            "align": "right"
          }
        ],
        "columns": [
          {
            "type": "static",
            "name": "title",
            "id": "u:2350c68b435e",
            "label": "名称",
            "searchType": "like",
            "placeholder": ""
          },
          {
            "name": "status",
            "id": "u:190623822086",
            "label": "状态",
            "static": true
          },
          {
            "name": "createTime",
            "id": "u:190623822086",
            "label": "更新时间",
            "static": true
          },
          {
            "id": "u:268f3538ca6c",
            "label": "操作",
            "type": "operation",
            "buttons": [
              {
                "type": "button",
                "label": "编辑",
                "level": "link",
                "id": "u:03bcf20a1c42",
                "actionType": "dialog",
                "target": "name_9445694ef9a8",
                "dialog": {
                  "title": "编辑",
                  "body": [
                    {
                      "type": "form",
                      "id": "u:d85bcc5dbdf2",
                      "mode": "horizontal",
                      "title": "新增",
                      "body": [
                        {
                          "type": "input-text",
                          "label": "名称",
                          "name": "title",
                          "id": "u:53093a37bc30",
                          "required": true,
                          "searchType": "like",
                          "placeholder": "请输入设备名称"
                        },
                        {
                          "label": "代码json",
                          "name": "amisJson",
                          "type": "editor",
                          "id": "u:430622998981",
                          "searchType": "like",
                          "placeholder": "请输入设备名称",
                          "required": true
                        },
                        
                        {
                          "label": "状态",
                          "name": "status",
                          "type": "radios",
                          "id": "u:12c696d88bb1",
                          "options": [
                            {
                              "label": "已发布",
                              "value": "1"
                            },
                            {
                              "label": "未发布",
                              "value": "2"
                            }
                          ]
                        },
                        {
                          "label": "类型",
                          "name": "type",
                          "type": "radios",
                          "id": "u:12c696d88bb1",
                          "options": [
                            {
                              "label": "页面",
                              "value": "1"
                            },
                            {
                              "label": "组件",
                              "value": "2"
                            },
                            {
                              "label": "模版",
                              "value": "3"
                            },
                          ]
                        }
                      ],
                      "api": {
                        "url": "/admin-api/system/amis/update",
                        "method": "put",
                        "requestAdaptor": "",
                        "adaptor": "",
                        "messages": {},
                        "data": {
                          "&": "$$",
                          "amisJson":"${amisJson}"
                        }
                      },
                      "wrapWithPanel": false,
                      "feat": "Edit",
                      "dsType": "api",
                      "debug": false,
                      "resetAfterSubmit": true,
                      "rules": [],
                      "initApi": {
                        "method": "get",
                        "url": "/admin-api/system/amis/get?id=${id}",
                        "requestAdaptor": "",
                        "adaptor": "",
                        "messages": {}
                      }
                    }
                  ],
                  "id": "u:06aa68139bf9",
                  "size": "md",
                  "actions": [
                    {
                      "type": "button",
                      "actionType": "cancel",
                      "label": "取消",
                      "id": "u:c9c771f0a045"
                    },
                    {
                      "type": "button",
                      "actionType": "confirm",
                      "label": "确定",
                      "primary": true,
                      "id": "u:eeaedb61befd"
                    }
                  ]
                }
              },
              {
                "type": "button",
                "label": "查看",
                "level": "link",
                "id": "u:80011d373144",
                "onEvent": {
                  "click": {
                    "weight": 0,
                    "actions": [
                      {
                        "ignoreError": false,
                        "actionType": "url",
                        "args": {
                          "url": "/#/MyEditor/${id}/${title}",
                          "blank": true
                        }
                      }
                    ]
                  }
                }
              },
              {
                "type": "button",
                "label": "删除",
                "level": "link",
                "id": "u:208b2cedd205",
                "className": "text-danger",
                "confirmText": "确定要删除？",
                "actionType": "ajax",
                "api": {
                  "method": "delete",
                  "url": "/admin-api/system/article/delete/${id}"
                }
              }
            ]
          }
        ],
        "name": "name_9445694ef9a8",
        "quickSaveItemApi": {
          "method": "put",
          "url": "/diary/api/briefing/update",
          "data": {
            "&": "$$",
            amisJson:"amisJson | toJson"
          }
        },
        "bulkActions": [],
        "affixHeader": false,
        "perPageAvailable": [
          10
        ],
        "messages": {},
        "filterTogglable": false,
        "keepItemSelectionOnPageChange": false,
        "alwaysShowPagination": true,
        "columnsTogglable": true
      }
    ],
    "asideResizor": false,
    "pullRefresh": {
      "disabled": true
    },
    "regions": [
      "body"
    ],
    "themeCss": {
      "baseControlClassName": {
        "boxShadow:default": " 0px 0px 0px 0px transparent"
      },
      "bodyControlClassName": {
        "boxShadow:default": " 0px 0px 0px 0px transparent"
      }
    }
  }
  const { auth } = useStore()
  return (
    <div>
        <MyEditor isEditor={true}></MyEditor>
        <AmisRenderer schema={app} fetcher={fetcher} hasRouter={true}></AmisRenderer>
    </div>
  )
}
