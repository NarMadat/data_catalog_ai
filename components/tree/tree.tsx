'use client'

import * as React from 'react'
import Tree, { CustomNodeElementProps } from 'react-d3-tree'
import initialData from '@/data/data.json'
import { useEffect, useState } from 'react'
import { TreeNodeDatum } from 'react-d3-tree/lib/types/types/common'

interface TreeNode {
  name: string
  attributes?: Record<string, string | number | boolean>
  children?: TreeNode[]
  metadata?: any
  color?: any
  isExpanded?: boolean
}

const CustomNodeComponent: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode
}) => {
  const rectWidth = 160
  const rectHeight = 30
  return (
    <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
      <text
        x={-20}
        y={-20}
        fill="black"
        fontSize="12px"
        textAnchor="middle"
        stroke={'#555'}
        strokeWidth={1}
        dominantBaseline="middle"
      >
        {nodeDatum.name}
      </text>
      <circle cx={0} cy={0} r={10} fill="#254854" />
    </g>
  )
}

export interface DataTreeProps {
  searchTerm?: string
}

export function DataTree({ searchTerm }: DataTreeProps) {
  const [data, setData] = useState<TreeNode[]>([])
  const [depth, setDepth] = useState(1)

  const [filteredData, setFilteredData] = useState<TreeNode | null | any>(
    initialData
  )
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      const result = getFilteredTreeData(initialData, searchTerm)
      setFilteredData(result)
      updateExpandedNodes(result)
      setDepth(5)
    }
  }, [searchTerm])

  const updateExpandedNodes = (node: TreeNode | null) => {
    if (!node) return

    const traverse = (n: TreeNode) => {
      if (n.isExpanded) {
        setExpandedNodes(prev => new Set(prev.add(n.name)))
      }
      n.children?.forEach(traverse)
    }

    traverse(node)
  }

  const handleNodeToggle = (nodeData: any) => {
    setExpandedNodes(prev => {
      const newExpandedNodes = new Set(prev)
      if (newExpandedNodes.has(nodeData.name)) {
        newExpandedNodes.delete(nodeData.name)
      } else {
        newExpandedNodes.add(nodeData.name)
      }
      return newExpandedNodes
    })
  }

  const filterNodes = (node: TreeNode, searchTerm: string): TreeNode | null => {
    let matches = false

    // Check if the current node matches the search term
    if (
      node.name &&
      typeof node.name === 'string' &&
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      matches = true
    }

    // Recursively filter children nodes
    const filteredChildren = node.children
      ?.map(child => filterNodes(child, searchTerm))
      .filter(child => child !== null) as TreeNode[] | undefined

    if (filteredChildren && filteredChildren.length > 0) {
      matches = true
    }

    // Create a new node with updated children if it or any of its children match the search term
    const newNode = { ...node, children: filteredChildren }

    if (matches) {
      // Mark this node as expanded
      return { ...newNode, isExpanded: true }
    }

    return null
  }

  // Function to get nodes and their parents based on the search term
  const getFilteredTreeData = (
    rootNode: TreeNode,
    searchTerm: string
  ): TreeNode | null => {
    console.log(filterNodes(rootNode, searchTerm))

    return filterNodes(rootNode, searchTerm)
  }

  // @ts-ignore
  return (
    <div
      id="treeWrapper"
      style={{ width: '100%', height: '2400px' }}
      className={'p-12'}
    >
      {filteredData && (
        <Tree
          data={filteredData}
          renderCustomNodeElement={rd3tProps => (
            <CustomNodeComponent {...rd3tProps} />
          )}
          rootNodeClassName="node__root"
          branchNodeClassName="node__branch"
          leafNodeClassName="node__leaf"
          initialDepth={depth}
          nodeSize={{ x: 360, y: 50 }}
          draggable={true}
          zoom={0.8}
          zoomable={false}
          transitionDuration={300}
          centeringTransitionDuration={500}
          translate={{ x: 0, y: filteredData ? 300 : 450 }}
          dimensions={{ width: 700, height: 300 }}
          collapsible={true}
          shouldCollapseNeighborNodes={false}
          onNodeClick={handleNodeToggle}
        />
      )}
    </div>
  )
}
