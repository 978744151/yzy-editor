import React from "react";
import { Tabs, Tab, } from 'amis-ui';
import './scss/CompTemplate.scss'
import { autobind } from "amis-core";
import rendererGrupList from './common/rendererGrupList'
import { message } from 'antd';
import {
  Loading3QuartersOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { getTid } from "@/utils/index.js";
const tid = getTid()
export class CompBusiness extends React.Component {
  state = {
    compList: [],
    platformList: [],
    loading: false,
    activeKey: sessionStorage.getItem('bussinessKey') || 'platform'
  }
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.refresh()
  }
  handleSelect = (key) => {
    this.setState({ activeKey: key }, () => {
      sessionStorage.setItem('bussinessKey', key)
      this.refresh(key)
    })
  }
  @autobind
  handleDragStart(e) {
    console.log(e)
    const current = e.currentTarget;
    const id = current.getAttribute('data-id');
    console.log(e.dataTransfer, id)
    e.dataTransfer.setData(`dnd-dom/[data-id="${id}"]`, '');
  }
  @autobind
  handleInsert(row) {
    if (!row.amisJson) {
      message.warning('请配置组件');
      return
    }
    const schemaJson = { ...JSON.parse(row.amisJson) }
    this.props.manager.addElem(schemaJson)
  }

  refresh = () => {
    this.setState({ loading: true })
    this.props.manager.env.fetcher({
      url: '/admin-api/system/amis/page?type=2',
      method: "get",
      params: {
        type: '1'
      }
    }).then(res => {
            if (this.state.activeKey === 'tenant')
        sessionStorage.setItem('tenantCompList', JSON.stringify(res.data.data.list || []))
      else sessionStorage.setItem('platformCompList', JSON.stringify(res.data.data.list || []))
      this.setState({ loading: false })
    })
  }
  render() {
    const tenantCompList = JSON.parse(sessionStorage.getItem('tenantCompList')) || []
    const platformCompList = JSON.parse(sessionStorage.getItem('platformCompList')) || []
    console.log(tenantCompList,platformCompList)
    return (
      <div className="ae-RendererPanel">
        <div className="panel-header"><div className="comp-refresh-icon">业务组件
          {this.state.loading && <LoadingOutlined />}
          {!this.state.loading && <Loading3QuartersOutlined onClick={this.refresh} />}
        </div> </div>
        <div className="ae-RendererPanel-content">
          <Tabs tabsMode={'line'} onSelect={this.handleSelect} curTheme="cxd" activeKey={this.state.activeKey} className="ae-RendererList-tabs"
            linksClassName="ae-RendererList-tabs-header"
            contentClassName="ae-RendererList-tabs-content" >
            <Tab title="公共"
              key="platform"
              eventKey="platform"
            >
              {platformCompList && platformCompList.length > 0 && rendererGrupList(platformCompList, this)}
            </Tab>
            {tid && <Tab title="租户" key="tenant" eventKey="tenant">
              {tenantCompList && tenantCompList.length > 0 && rendererGrupList(tenantCompList, this)}
            </Tab>}
          </Tabs>
        </div>
      </div>
    )
  }
}
