import React, { useEffect } from "react";
import { Tabs, Tab, } from 'amis-ui';
import './scss/CompTemplate.scss'
import { autobind } from "amis-core";
import rendererGrupList from './common/rendererGrupList'
import { getTid } from "@/utils/index.js";
import {
  Loading3QuartersOutlined,
  LoadingOutlined
} from '@ant-design/icons';
const tid = getTid()
export class CompTemplate extends React.Component {
  state = {
    compList: [],
    platformList: [],
    loading: false,
    activeKey: sessionStorage.getItem('templateKey') || 'platform'
  }
  constructor(props) {
    super(props)

  }
  componentDidMount() {
    this.refresh()
  }
  handleSelect = (key) => {
    this.setState({ activeKey: key }, () => {
      sessionStorage.setItem('templateKey', key)
      this.refresh(key)
    })
  }
  @autobind
  handleInsert(row) {
    const schemaJson = { ...JSON.parse(row.designJson), type: 'container' }
    this.props.manager.addElem(schemaJson)
  }
  @autobind
  handleDragStart(e) {
    console.log(e)
    e.dataTransfer.setData(`dnd-dom/[data-id="1212121212dsdsds"]`, '');
  }
  refresh = () => {
    this.setState({ loading: true })
    console.log(this.props)
    const { activeKey } = this.state
    this.props.manager.env.fetcher({
      url: '/admin-api/system/amis/page?type=2',
      method: "get",
      params: {
        type: '3',
        level: activeKey,
      }
    }).then(res => {
      console.log(res.data.data.list)
      if (activeKey === 'tenant') sessionStorage.setItem('tenantTempList', JSON.stringify(res.data.data.list || []))
      else sessionStorage.setItem('platformTempList', JSON.stringify(res.data.data.list || []))
      this.setState({ loading: false })
    })
  }

  render() {
    const tenantTempList = JSON.parse(sessionStorage.getItem('tenantTempList'))
    const platformTempList = JSON.parse(sessionStorage.getItem('platformTempList'))
    return (
      <div className="ae-RendererPanel">
        <div className="panel-header"><div className="comp-refresh-icon">业务组件
          {this.state.loading && <LoadingOutlined />}
          {!this.state.loading && <Loading3QuartersOutlined onClick={this.refresh} />}
        </div></div>
        <div className="ae-RendererPanel-content">
          <Tabs tabsMode={'line'} onSelect={this.handleSelect} curTheme="cxd" activeKey={this.state.activeKey} className="ae-RendererList-tabs"
            linksClassName="ae-RendererList-tabs-header"
            contentClassName="ae-RendererList-tabs-content" >
            <Tab title="公共"
              key="platform"
              eventKey="platform"
            >
              {rendererGrupList(platformTempList, this)}
            </Tab>
            {tid && <Tab title="租户" key="tenant" eventKey="tenant">
              {tenantTempList?.length > 0 && rendererGrupList(tenantTempList, this)}
            </Tab>}
          </Tabs>
        </div>
      </div>
    )
  }
}
