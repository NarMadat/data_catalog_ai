import * as React from 'react'
import { useEffect, useState } from 'react'
import { CustomNodeElementProps } from 'react-d3-tree'

export const CustomTreeNode: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode
}) => {
  const [wrappedText, setWrappedText] = useState<string[]>([])

  useEffect(() => {
    const maxWidth = 320
    const words = nodeDatum.name.split(' ')
    const lines: string[] = []
    let currentLine = words[0]

    // Create a temporary SVG text element to measure text width
    const tempSvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    const tempText = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    )
    tempSvg.appendChild(tempText)
    document.body.appendChild(tempSvg)

    for (let i = 1; i < words.length; i++) {
      tempText.textContent = currentLine + ' ' + words[i]
      if (tempText.getComputedTextLength() < maxWidth) {
        currentLine += ' ' + words[i]
      } else {
        lines.push(currentLine)
        currentLine = words[i]
      }
    }
    lines.push(currentLine)

    document.body.removeChild(tempSvg)
    setWrappedText(lines)
  }, [nodeDatum.name])

  return (
    <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
      {wrappedText.map((line, index) => (
        <text
          key={index}
          x={-7}
          y={-10 + index * 14}
          fill="black"
          fontSize="10px"
          textAnchor="end"
          stroke={'#555'}
          strokeWidth={0}
          dominantBaseline="middle"
        >
          {line}
        </text>
      ))}
      <circle cx={0} cy={0} r={5} fill="darkblue" strokeWidth={0} />
    </g>
  )
}

export default CustomTreeNode
