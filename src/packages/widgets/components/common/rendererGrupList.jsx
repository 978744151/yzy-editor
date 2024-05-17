import React from 'react'
import { Tooltip } from 'antd'
import { Icon, Collapse, CollapseGroup } from 'amis-ui'
// const { Panel } = Collapse;
import '../scss/CompTemplate.scss'

export default function (list, that) {
  console.log('list',list)
  const activeKey = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <>
      <div className="comp">
        {/* <CollapseGroup defaultActiveKey={activeKey} ghost={true} size="small">
          {list &&
            list?.length > 0 &&
            list.map((item, index) => (
              <Collapse key={index} header={item.title} mountOnEnter={true}> */}
               { list && list.map((item, index) => (
                <div className="comp-list">
                  {item &&
                    // item.componentList.map((items, idx) => (
                      <div
                        key={index}
                        className="comp-list-item"
                        data-dnd-id={item.id}
                        data-dnd-type="subrenderer"
                        data-dnd-data={JSON.stringify(item.amisJson)}
                      >
                        <div
                          className="comp-list-item-logo"
                          onClick={() => that.handleInsert(item)}
                        >
                          <Icon icon="fa fa-window-restore" className="comp-icon" />
                        </div>
                        <Tooltip title={item.title}>
                          <div className="comp-list-item-text">{item.title}</div>
                        </Tooltip>
                      </div>
                    // ))
                    }
                </div>
                ))}
              {/* </Collapse>
            ))}
        </CollapseGroup> */}
      </div>
    </>
  )
}
