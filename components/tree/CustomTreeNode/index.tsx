import * as React from 'react'

import { CustomNodeElementProps } from 'react-d3-tree'

export const CustomTreeNode: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode
}) => {
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

export default CustomTreeNode
