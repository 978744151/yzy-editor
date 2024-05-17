import NestedSelectControl from 'amis/lib/renderers/Form/NestedSelect'
import { supportStatic } from 'amis/lib/renderers/Form/StaticHoc'
import { autobind, OptionsControl, unRegisterRenderer, getTreeAncestors, ucFirst } from 'amis-core'
import { ResultBox, Spinner, PopUp, Cascader } from 'amis-ui'

unRegisterRenderer('nested-select')
unRegisterRenderer('cascader-select')

export class MyNestedSelect extends NestedSelectControl {
  @supportStatic()
  render() {
    const {
      className,
      style,
      disabled,
      classnames: cx,
      multiple,
      placeholder,
      translate: __,
      inline,
      searchable,
      autoComplete,
      selectedOptions,
      clearable,
      loading,
      borderMode,
      mobileUI,
      popOverContainer,
      env,
      loadingConfig,
      maxTagCount,
      overflowTagPopover,
      valueMode,
    } = this.props
    let result = multiple ? selectedOptions : selectedOptions.length ? selectedOptions[0] : ''

    if (valueMode === 'all') {
      // 值全部显示，为数组 ['01', '011', '0111']
      result = selectedOptions[selectedOptions.length - 1]
    }
    return (
      <div className={cx('NestedSelectControl', className)} ref={this.outTarget}>
        <ResultBox
          mobileUI={mobileUI}
          maxTagCount={maxTagCount}
          overflowTagPopover={overflowTagPopover}
          disabled={disabled}
          ref={this.domRef}
          placeholder={__(placeholder ?? 'placeholder.empty')}
          inputPlaceholder={''}
          className={cx(`NestedSelect`, {
            'NestedSelect--inline': inline,
            'NestedSelect--single': !multiple,
            'NestedSelect--multi': multiple,
            'NestedSelect--searchable': searchable,
            'is-opened': this.state.isOpened,
            'is-focused': this.state.isFocused,
            [`NestedSelect--border${ucFirst(borderMode)}`]: borderMode,
          })}
          result={result}
          onResultClick={this.handleOutClick}
          value={this.state.inputValue}
          onChange={this.handleInputChange}
          onResultChange={this.handleResultChange}
          onClear={this.handleResultClear}
          itemRender={this.renderValue}
          onKeyPress={this.handleKeyPress}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.handleInputKeyDown}
          clearable={clearable}
          hasDropDownArrow={true}
          allowInput={searchable && !mobileUI}
        >
          {loading ? <Spinner loadingConfig={loadingConfig} size="sm" /> : undefined}
        </ResultBox>
        {mobileUI ? (
          <PopUp
            className={cx(`NestedSelect-popup`)}
            container={env.getModalContainer}
            isShow={this.state.isOpened}
            onHide={this.close}
            showConfirm={false}
            showClose={false}
          >
            <Cascader
              onClose={this.close}
              {...this.props}
              onChange={this.handleResultChange}
              options={this.props.options.slice()}
              value={selectedOptions}
            />
          </PopUp>
        ) : this.state.isOpened ? (
          this.renderOuter()
        ) : null}
      </div>
    )
  }

  @autobind
  async handleOptionClick(option) {
    const {
      multiple,
      onChange,
      joinValues,
      extractValue,
      valueField,
      onlyLeaf,
      valueMode, // 值的模式，all表示返回所有的值（带祖先），默认：选中的值
    } = this.props

    if (multiple) {
      return
    }

    let value = joinValues
      ? option[valueField || 'value']
      : extractValue
        ? option[valueField || 'value']
        : option

    if (value === undefined) {
      return
    }

    if (onlyLeaf && option.children) {
      return
    }

    if (valueMode === 'all') {
      const ancestors = getTreeAncestors(this.props.options, option, true)
      value = ancestors.map((item) => {
        return item[valueField || 'value']
      })
    }

    const isPrevented = await this.dispatchEvent('change', {
      value,
    })
    isPrevented || onChange(value)
    isPrevented || this.handleResultClear()
    /** 选项选择后需要重置下拉数据源：搜索结果 => 原始数据 */
    this.setState({ stack: [this.props.options] })
    this.close()
  }
}

@OptionsControl({
  type: 'nested-select',
})
export class MyNestedSelectRenderer extends MyNestedSelect {}

@OptionsControl({
  type: 'cascader-select',
})
export class MyCascaderSelectRenderer extends MyNestedSelect {}
