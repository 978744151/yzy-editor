/**
 * 类型映射关系
 * key：实体模型自定义的字段type
 * value:表单类型type
 */

export const type_mapper = {
  text: 'input-text',
  textarea: 'textarea',
  number: 'input-number',
  point: 'input-number',
  money: {
    type: 'input-number',
    precision: 2,
  },
  select: {
    type: 'select',
    _action: '请选择',
  },
  on_off: 'switch',
  date: {
    type: 'input-date',
    format: 'YYYY-MM-DD',
    inputFormat: 'YYYY-MM-DD',
  },
  datetime: {
    type: 'input-datetime',
    format: 'YYYY-MM-DD HH:mm:ss',
    inputFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  time: {
    type: 'input-time',
    format: 'HH:mm:ss',
    inputFormat: 'HH:mm:ss',
  },
  dates: 'input-date-range',
  datetimes: 'input-datetime-range',
  times: 'input-time-range',
  attachment() {
    const cfg = {
      type: 'input-file',
      receiver: {
        url: '/admin/sys-file/file',
        method: 'post',
      },
      joinValues: false,
      maxLength: 1,
      multiple: true,
    }
    if (item.isJsonStr) {
      cfg.joinValues = false
    }
    return cfg
  },
  picture(item) {
    const cfg = {
      type: 'input-image',
      receiver: {
        url: '/admin/sys-file/file',
        method: 'post',
      },
    }
    if (item.isJsonStr) {
      cfg.joinValues = false
    }
    return cfg
  },
  rich_text: {
    type: 'input-rich-text',
    receiver: {
      url: '/admin/sys-file/file',
      method: 'post',
    },
    vendor: 'tinymce',
    options: {
      toolbar:
        'undo redo bold italic outdent indent lineheight backcolor alignleft aligncenter alignright alignjustify bullist numlist  help wordcount code fullscreen table emoticons  link image preview underline strikethrough print ',
      menubar: true,
      height: 400,
      plugins:
        'advlist,autolink,link,image,lists,charmap,preview,anchor,pagebreak,searchreplace,wordcount,visualblocks,visualchars,code,fullscreen,insertdatetime,media,nonbreaking,table,emoticons,template,help',
    },
  },
  password: 'input-password',
  radios: 'radios',
  checkboxes: 'checkboxes',
  'button-group-select': 'button-group-select',
  switch: 'switch',
}

export const detail_type_mapper = {
  text: 'static',
  textarea: 'static',
  number: {
    type: 'input-number',
    static: true,
  },
  point: {
    type: 'input-number',
    static: true,
  },
  money: {
    type: 'input-number',
    static: true,
  },
  select: {
    type: 'select',
    static: true,
  },
  radios: {
    type: 'radios',
    static: true,
  },
  on_off: {
    type: 'switch',
    static: true,
    onText: '开',
    offText: '关',
  },
  date: {
    type: 'input-date',
    format: 'YYYY-MM-DD',
    inputFormat: 'YYYY-MM-DD',
    static: true,
  },
  datetime: {
    type: 'input-datetime',
    format: 'YYYY-MM-DD HH:mm:ss',
    inputFormat: 'YYYY-MM-DD HH:mm:ss',
    static: true,
  },
  time: {
    type: 'input-time',
    format: 'HH:mm:ss',
    inputFormat: 'HH:mm:ss',
    static: true,
  },
  dates: 'input-date-range',
  datetimes: 'input-datetime-range',
  times: 'input-time-range',
  attachment: {
    type: 'static-tpl',
    // eslint-disable-next-line quotes
    tpl: "<% let value = data && data['attachment'];%><% if (value) { %>\n        <%\n          let file = value;\n          try {\n            file = typeof file === 'string' ? JSON.parse(file) : file;\n          } catch {\n            file = {}\n          }\n          let url = file.url;\n          let a = document.createElement('a');\n          a.href = url;\n        %>\n          <a target=\"_blank\" href=\"<%= url %>\" download><%- file.name %></a>\n        <% } else {%>\n          -\n        <% }%>\n        ",
  },
  picture(item) {
    const cfg = {
      type: 'input-image',
      disabled: true,
    }
    if (item.isJsonStr) {
      cfg.joinValues = false
      // cfg.src = "${tableName.fieldName.url}"
      //   .replace(/tableName/g, item.tableName)
      //   .replace(/fieldName/, item.fieldName);
    }
    return cfg
  },
  password: {
    type: 'input-password',
    static: true,
  },
  rich_text: 'static',
  switch: {
    type: 'switch',
    static: true,
  },
}

/**
 * 用于input-table
 */
export const static_form_mapper = {
  text: 'text',
  textarea: 'static',
  number: {
    type: 'input-number',
    static: true,
  },
  point: {
    type: 'input-number',
    static: true,
  },
  money: {
    type: 'input-number',
    static: true,
  },
  select: {
    type: 'select',
    static: true,
  },
  radios: {
    type: 'radios',
    static: true,
  },
  on_off: {
    type: 'switch',
    static: true,
    onText: '开',
    offText: '关',
  },
  date: {
    type: 'input-date',
    format: 'YYYY-MM-DD',
    inputFormat: 'YYYY-MM-DD',
    static: true,
  },
  datetime: {
    type: 'input-datetime',
    format: 'YYYY-MM-DD HH:mm:ss',
    inputFormat: 'YYYY-MM-DD HH:mm:ss',
    static: true,
  },
  time: {
    type: 'input-time',
    format: 'HH:mm:ss',
    inputFormat: 'HH:mm:ss',
    static: true,
  },
  dates: 'input-date-range',
  datetimes: 'input-datetime-range',
  times: 'input-time-range',
  attachment: {
    type: 'static-tpl',
    // eslint-disable-next-line quotes
    tpl: "<% let value = data && data['attachment'];%><% if (value) { %>\n        <%\n          let file = value;\n          try {\n            file = typeof file === 'string' ? JSON.parse(file) : file;\n          } catch {\n            file = {}\n          }\n          let url = file.url;\n          let a = document.createElement('a');\n          a.href = url;\n        %>\n          <a target=\"_blank\" href=\"<%= url %>\" download><%- file.name %></a>\n        <% } else {%>\n          -\n        <% }%>\n        ",
  },
  picture: 'static-image',
  password: {
    type: 'input-password',
    static: true,
  },
  rich_text: 'static',
  switch: {
    type: 'switch',
    static: true,
  },
}
function getTextCfg(field) {
  return {
    type: 'input-text',
    placeholder: '请输入' + field.showName,
    clearable: true,
  }
}
export const query_type_mapper = {
  text: getTextCfg,
  textarea: getTextCfg,
  number: 'input-number',
  point: 'input-number',
  money: {
    type: 'input-number',
    precision: 2,
  },
  select(field) {
    return {
      type: 'select',
      placeholder: '请选择' + field.showName,
      clearable: true,
    }
  },
  on_off: 'switch',
  date(item) {
    const { tableName, fieldName, extraCfg } = item
    const { searchType } = extraCfg
    return {
      type: searchType === 'between' ? 'input-date-range' : 'input-date',
      format: 'YYYY-MM-DD',
      name: tableName + '.' + fieldName,
    }
  },
  datetime(item) {
    const { tableName, fieldName, extraCfg } = item
    const { searchType } = extraCfg
    return {
      type: searchType === 'between' ? 'input-datetime-range' : 'input-datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      name: tableName + '.' + fieldName,
    }
  },
  time: 'input-time',
  dates: 'input-date-range',
  datetimes: 'input-datetime-range',
  times: 'input-time-range',
  // attachment: 'input-file',
  // picture: 'input-image',
  // password: 'input-password',
  rich_text: getTextCfg,
  radios: 'radios',
  checkboxes: 'checkboxes',
  'button-group-select': 'button-group-select',
  switch: 'switch',
}

export const form_to_detail_type_mapper = {
  'input-rich-text': 'static',
  'input-text': 'input',
  'input-date': 'date',
}
