import React, { Component } from 'react'
import {
  autobind,
  isEffectiveApi,
  isPureVariable,
  normalizeApi,
  resolveVariableAndFilter,
} from 'amis-core'

export function withOptions(cfg = {}) {
  return function (WrapperComponent) {
    const { hasSelectAll } = cfg
    return class OptionsFormItem extends Component {
      static defaultProps = {
        hasAll: true,
        allValue: '',
        allLabel: '不限',
        labelField: 'label',
        valueField: 'value',
      }
      constructor(props) {
        super(props)
        const { source, options } = props
        if (!source && options) {
          this.state = {
            options: this.addAllOption(options),
          }
        } else {
          this.state = {
            options: [],
          }
        }
      }

      @autobind
      addAllOption(options) {
        if (hasSelectAll && this.props.hasAll) {
          const { allValue, allLabel, labelField, valueField } = this.props
          if (Array.isArray(options)) {
            const hasAllItem = options.includes((item) => item[valueField] === allValue)
            if (!hasAllItem) {
              return [
                {
                  [labelField]: allLabel,
                  [valueField]: allValue,
                },
              ].concat(options)
            }
            return options
          }
          console.error('source必须是数组')
          return []
        }
        return options
      }

      componentDidMount() {
        this.handleSourceChange()
      }

      @autobind
      async handleSourceChange() {
        const { source, data, env } = this.props
        if (source) {
          if (isPureVariable(source)) {
            const _source = resolveVariableAndFilter(source, data, '| raw')
            this.setState({
              options: this.addAllOption(_source),
            })
          } else if (isEffectiveApi(source)) {
            const api = normalizeApi(source)
            const res = await env.fetcher(api, data)
            const _options = this.addAllOption(res.data)
            // console.log('_options', _options)
            this.setState({
              options: _options,
            })
          }
        }
      }

      componentDidUpdate(prevProps) {
        // console.log('prevProps', prevProps, this.props)
        if (this.props.options != prevProps.options) {
          this.setState({
            options: this.addAllOption(this.props.options),
          })
        }
        if (this.props.source != prevProps.source) {
          this.handleSourceChange()
        }
      }

      render() {
        const { source, options: _options, hasAll, ...rest } = this.props
        const { options } = this.state
        return <WrapperComponent options={options} {...rest} />
      }
    }
  }
}
