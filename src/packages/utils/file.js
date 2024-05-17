/**
 * 下载Blob文件
 *  @param {string} url - blobUrl blob地址
 *  @param {string} filename - 文件名
 **/
export function downloadBlob(url, filename) {
  // 下载后文件名，默认为系统时间
  filename = filename || new Date().getTime()
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  //   $('body').append(temp)
  a.click()
}

export function exportExcel(data, type, filename) {
  console.log('type', type)
  // const blob = new Blob([data], {
  //   type: type || "application/xlsx",
  // });
  // const blobUrl = window.URL.createObjectURL(blob);
  // downloadBlob(blobUrl, "导出.xlsx");
  // application/vnd.ms-excel
  //
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  })

  const blobUrl = window.URL.createObjectURL(blob)
  console.log(blobUrl)
  downloadBlob(blobUrl, filename || '导出.xlsx')
  // saveAs(blob, filename);
}
