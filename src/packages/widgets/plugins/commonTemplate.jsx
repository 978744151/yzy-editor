import React from 'react'
import { BasePlugin, registerEditorPlugin } from 'amis-editor'
import { Icon } from 'amis'
// import WidthDraggableContainer from 'amis-editor';
import { CompTemplate } from '../components/CompTemplate'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all'
import { autobind } from 'amis-core'
import WidthDraggableContainer from '../components/common/WidthDraggableContainer'

/**
 * 大纲面板
 */
export class commonTemplatePlugin extends BasePlugin {
  static scene = ['layout']
  order = -9997

  @autobind
  buildEditorPanel(context, panels) {
    const store = this.manager.store
    const style = {
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
    const iconStyle = {
      width: '20px',
      height: '20px',
      color: '#333',
    }
    // 多选时显示大纲面板
    if (store && context.selections.length) {
      const { changeLeftPanelOpenStatus, changeLeftPanelKey } = store
      changeLeftPanelOpenStatus(true)
      changeLeftPanelKey('outline')
    }
    panels.push({
      key: 'commonTemplate',
      pluginIcon: 'fa', // 'fa fa-navicon',
      title: (
        <span className="question-mark" style={style} editor-tooltip="模版">
          <Icon icon="menu" className="icon" style={iconStyle} size="16" />
        </span>
      ),
      position: 'left',
      order: 7000,
      component: WidthDraggableContainer(CompTemplate),
    })
  }
}

registerEditorPlugin(commonTemplatePlugin)
