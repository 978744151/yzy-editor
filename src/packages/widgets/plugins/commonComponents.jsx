import React from 'react'
import { BasePlugin, registerEditorPlugin } from 'amis-editor'
import { Icon } from 'amis'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all'
import { autobind } from 'amis-core'
import { CompBusiness } from '../components/CompBusiness'

import WidthDraggableContainer from '../components/common/WidthDraggableContainer'
/**
 * 大纲面板
 */
export class commonComponentsPlugin extends BasePlugin {
  static scene = ['layout']
  order = -9998
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

    panels.push({
      key: 'commonComponents',
      icon: 'png-icon outline-png', // 'fa fa-navicon',
      title: (
        <span className="question-mark" style={style} editor-tooltip="组件">
          <Icon icon="department" style={iconStyle} className="icon" />
        </span>
      ),
      position: 'left',
      order: 6000,
      component: WidthDraggableContainer(CompBusiness),
    })
  }
}

registerEditorPlugin(commonComponentsPlugin)
