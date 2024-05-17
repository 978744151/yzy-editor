// amis inputFile 暂未
import FileControl from 'amis/lib/renderers/Form/inputFile'
import { FormItem } from 'amis'
import DropZone from 'react-dropzone'
import { TooltipWrapper, Button } from 'amis-ui'

export default class FileControlRender extends FileControl {
  order = -400
  handleClickFile(file, e) {
    e.preventDefault()
    e.stopPropagation()

    const { downloadUrl } = this.props
    const urlField = this.props.urlField || 'url'
    const valueField = this.props.valueField || 'value'

    const fileUrl = file[urlField] || file[valueField]
    const api =
      typeof downloadUrl === 'string' && !~downloadUrl.indexOf('$') && typeof fileUrl === 'string'
        ? `${downloadUrl}${fileUrl}`
        : downloadUrl
          ? downloadUrl
          : undefined

    api && this.handleApi(api, file)
  }
  render() {
    const {
      btnLabel,
      accept,
      disabled,
      maxLength,
      maxSize,
      multiple,
      autoUpload,
      description,
      descriptionClassName,
      hideUploadButton,
      className,
      style,
      btnClassName,
      btnUploadClassName,
      classnames: cx,
      translate: __,
      render,
      downloadUrl,
      templateUrl,
      drag,
      data,
      documentation,
      documentLink,
      env,
      container,
    } = this.props
    let { files, uploading, error } = this.state
    const nameField = this.props.nameField || 'name'
    const valueField = this.props.valueField || 'value'
    const urlField = this.props.urlField || 'url'
    const hasPending = files.some((file) => file.state == 'pending')
    let uploaded = 0
    let failed = 0
    this.state.uploading ||
      this.state.files.forEach((item) => {
        if (item.state === 'error') {
          failed++
        } else if (item.state === 'uploaded') {
          uploaded++
        }
      })
    return (
      <div className={cx('FileControl', className)}>
        {templateUrl ? (
          <a className={cx('FileControl-templateInfo')} onClick={this.downloadTpl.bind(this)}>
            <Icon icon="download" className="icon" />
            <span>{__('File.downloadTpl')}</span>
          </a>
        ) : null}

        <DropZone
          disabled={disabled}
          key="drop-zone"
          ref={this.dropzone}
          onDrop={this.handleDrop}
          onDropRejected={this.handleDropRejected}
          accept={accept === '*' ? '' : accept}
          multiple={multiple}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps({
                onClick: preventEvent,
              })}
              className={cx('FileControl-dropzone', {
                disabled: disabled || (multiple && !!maxLength && files.length >= maxLength),
                'is-empty': !files.length,
                'is-active': isDragActive,
              })}
            >
              <input disabled={disabled} {...getInputProps()} />

              {drag || isDragActive ? (
                <div className={cx('FileControl-acceptTip')} onClick={this.handleSelect}>
                  <Icon icon="cloud-upload" className="icon" />
                  <span>
                    {__('File.dragDrop')}
                    <span className={cx('FileControl-acceptTip-click')}>
                      {__('File.clickUpload')}
                    </span>
                  </span>
                  <div className={cx('FileControl-acceptTip-help', 'TplField')}>
                    {documentLink ? (
                      <a href={documentLink} onClick={(e) => e.stopPropagation()}>
                        {documentation ? documentation : __('File.helpText')}
                      </a>
                    ) : null}
                  </div>
                  {maxSize ? (
                    <div className={cx('FileControl-sizeTip')}>
                      {__('File.sizeLimit', {
                        maxSize: prettyBytes(maxSize, 1024),
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <Button
                    level="default"
                    disabled={disabled}
                    className={cx('FileControl-selectBtn', btnClassName, {
                      'is-disabled': multiple && !!maxLength && files.length >= maxLength,
                    })}
                    tooltip={
                      multiple && maxLength && files.length >= maxLength
                        ? __('File.maxLength', { maxLength })
                        : ''
                    }
                    onClick={this.handleSelect}
                  >
                    <Icon icon="upload" className="icon" />
                    <span>
                      {!multiple && files.length
                        ? __('File.repick')
                        : multiple && files.length
                          ? __('File.continueAdd')
                          : filter(btnLabel, data) || __('File.upload')}
                    </span>
                  </Button>
                </>
              )}
              {description
                ? render('desc', description, {
                    className: cx('FileControl-description', descriptionClassName),
                  })
                : null}
            </div>
          )}
        </DropZone>

        {maxSize && !drag ? (
          <div className={cx('FileControl-sizeTip')}>
            {__('File.sizeLimit', { maxSize: prettyBytes(maxSize, 1024) })}
          </div>
        ) : null}

        {Array.isArray(files) ? (
          <ul className={cx('FileControl-list')}>
            {files.map((file, index) => {
              const filename = file[nameField] || file.filename || file.name

              return (
                <li key={file.id}>
                  <TooltipWrapper
                    placement="bottom"
                    container={container || env?.getModalContainer}
                    tooltipClassName={cx(
                      'FileControl-list-tooltip',
                      (file.state === 'invalid' || file.state === 'error') && 'is-invalid'
                    )}
                    tooltip={
                      file.state === 'invalid' || file.state === 'error'
                        ? file.error ||
                          (maxSize && file.size > maxSize
                            ? __('File.maxSize', {
                                filename: file.name,
                                actualSize: prettyBytes(file.size, 1024),
                                maxSize: prettyBytes(maxSize, 1024),
                              })
                            : '')
                        : filename
                    }
                  >
                    <div
                      className={cx('FileControl-itemInfo', {
                        'is-invalid': file.state === 'invalid' || file.state === 'error',
                      })}
                    >
                      <span className={cx('FileControl-itemInfoIcon')}>
                        <Icon icon="file" className="icon" />
                      </span>

                      {file[urlField] || file[valueField] || downloadUrl ? (
                        <a
                          className={cx('FileControl-itemInfoText')}
                          target="_blank"
                          rel="noopener"
                          href="#"
                          onClick={this.handleClickFile.bind(this, file)}
                        >
                          {filename}
                        </a>
                      ) : (
                        <span className={cx('FileControl-itemInfoText')}>{filename}</span>
                      )}

                      {!disabled ? (
                        <a
                          data-tooltip={__('Select.clear')}
                          data-position="left"
                          className={cx('FileControl-clear')}
                          onClick={() => this.removeFile(file, index)}
                        >
                          <Icon icon="close" className="icon" />
                        </a>
                      ) : null}
                    </div>
                  </TooltipWrapper>

                  {file.state === 'uploading' ? (
                    <div className={cx('FileControl-progressInfo')}>
                      <div className={cx('FileControl-progress')}>
                        <span style={{ width: `${(file.progress || 0) * 100}%` }} />
                      </div>
                      <span>{Math.round((file.progress || 0) * 100)}%</span>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}

        {failed ? (
          <div className={cx('FileControl-sum')}>
            {__('File.result', {
              uploaded,
              failed,
            })}
            <a onClick={this.retry}>{__('File.retry')}</a>
            {__('File.failed')}
          </div>
        ) : null}
        {!autoUpload && !hideUploadButton && files.length ? (
          <Button
            level="default"
            disabled={!hasPending}
            className={cx('FileControl-uploadBtn', btnUploadClassName)}
            onClick={this.toggleUpload}
          >
            {__(uploading ? 'File.pause' : 'File.start')}
          </Button>
        ) : null}
      </div>
    )
  }
}
@FormItem({
  type: 'my-input-file',
  renderLabel: true,
  sizeMutable: false,
  renderDescription: false,
})
export class FileControlRenderer extends FileControlRender {}
