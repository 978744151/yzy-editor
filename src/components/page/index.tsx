import { useState } from 'react'
import { AmisRenderer } from '@/packages'
import { fetcherFactory } from '@/packages/utils/amis'
import axios from '@/plugins/axios'

export default function Preview() {
  const fetcher = fetcherFactory(axios)
  const str = sessionStorage.getItem('amisSchema')
  const json = JSON.parse(str)

  const [schema, setSchema] = useState(json)
  const app = {
    "type": "page",
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
                      "name": "deviceTitle",
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
                      "name": "deviceTitle",
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
                      "name": "radios",
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
                    }
                  ],
                  "api": {
                    "method": "post",
                    "url": "/admin-api/system/amis/create",
                    "convertKeyToPath": false,
                    "data": {
                      "&": "$$"
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
            "name": "deviceTitle",
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
                          "name": "deviceTitle",
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
                          "name": "radios",
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
                        }
                      ],
                      "api": {
                        "url": "/admin-api/system/amis/update",
                        "method": "get",
                        "requestAdaptor": "",
                        "adaptor": "",
                        "messages": {},
                        "data": {
                          "&": "$$"
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
                "label": "删除",
                "level": "link",
                "id": "u:80011d373144",
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
            "&": "$$"
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
    "id": "u:e5e91f4f480d",
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
  return <AmisRenderer schema={app} fetcher={fetcher} hasRouter={true}></AmisRenderer>
}
