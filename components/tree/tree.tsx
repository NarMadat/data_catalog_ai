'use client'

import * as React from 'react'
import Tree from 'react-d3-tree'
import initialData from '@/data/data.json'
import { useEffect, useState } from 'react'
import { CustomTreeNode } from '@/components/tree/CustomTreeNode'
import { getFilteredTreeData, TreeNode } from '@/lib/utils'
import { Col, Row } from 'antd'
import Ripple from '@/components/ui/ripple'

export interface DataTreeProps {
  searchTerm?: string
}

export function DataTree({ searchTerm }: DataTreeProps) {
  const [depth, setDepth] = useState(1)
  const [zoom, setZoom] = useState(0.8)
  const [filteredData, setFilteredData] = useState<TreeNode | null | any>(
    initialData
  )
  const [showRipple, setShowRipple] = useState(false)
  const [showTree, setShowTree] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setShowTree(true)
    }, 2000)
    setShowRipple(true)
  }, [])

  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      const result = getFilteredTreeData(initialData, searchTerm)
      setFilteredData(result)
      setDepth(5)
      setZoom(0.7)
    }
  }, [searchTerm])

  if (!showRipple) {
    return <></>
  }
  if (!showTree) {
    return (
      <div className="container">
        <Row>
          <Col
            xs={24}
            id="treeWrapper"
            className={
              'p-4  border border-1 border-gray-400  rounded shadow-sm shadow-slate-200 h-dvh w-full bg-gray-100'
            }
          >
            <Ripple />
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <div className="container">
      <Row>
        <Col
          xs={24}
          id="treeWrapper"
          className={
            'p-4  border border-1 border-gray-400  rounded shadow-sm shadow-slate-200 h-dvh w-full bg-gray-100'
          }
        >
          {filteredData && showTree && (
            <Tree
              data={filteredData}
              renderCustomNodeElement={rd3tProps => (
                <CustomTreeNode {...rd3tProps} />
              )}
              rootNodeClassName="node__root"
              branchNodeClassName="node__branch"
              leafNodeClassName="node__leaf"
              initialDepth={depth}
              nodeSize={{ x: 360, y: 30 }}
              draggable={true}
              zoom={zoom}
              zoomable={true}
              transitionDuration={300}
              centeringTransitionDuration={500}
              translate={{ x: 100, y: 400 }}
              dimensions={{ width: 700, height: 750 }}
              collapsible={true}
              shouldCollapseNeighborNodes={false}
              pathClassFunc={() => 'custom-path'}
            />
          )}
        </Col>
        <style>
          {`
          .custom-path {
            stroke: #999; /* Customize the path color */
            stroke-width: 1px;
          }
        `}
        </style>
      </Row>
    </div>
  )
}
