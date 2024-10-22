import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import initialData from '@/data/data.json';
interface CustomHierarchyNode<T = any> extends d3.HierarchyNode<T> {
  x0?: number;
  y0?: number;
  x: number;
  y: number;
  numericId?: number;
  _children?: CustomHierarchyNode[];
  children?: CustomHierarchyNode[];
  data: T;
}
export function DataTree() {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1320,
    height: 500,
  });
  const baseMargin = { top: 20, right: 20, bottom: 20, left: 20 };
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (!isMounted) return;
    if (!treeContainerRef.current) return;
    const root = d3.hierarchy(initialData) as CustomHierarchyNode;
    const dx = 30;
    const dy = 350;
    const treeLayout = d3.tree<CustomHierarchyNode>().nodeSize([dx, dy]);
    const diagonal = d3
      .linkHorizontal<d3.HierarchyPointLink<CustomHierarchyNode>, d3.HierarchyPointNode<CustomHierarchyNode>>()
      .x((d) => d.y)
      .y((d) => d.x);
    const svg = d3
      .select(treeContainerRef.current)
      .append('svg')
      .attr('width', containerDimensions.width)
      .attr('height', containerDimensions.height)
      .attr(
        'viewBox',
        `0 0 ${containerDimensions.width} ${containerDimensions.height}`
      )
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('font-size', '8px')
      .style('user-select', 'none');
    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#F3F3F3');
    const gMain = svg
      .append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${baseMargin.left},${baseMargin.top})`);
    const gLink = gMain
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.2)
      .attr('class', 'links');
    const gNode = gMain
      .append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all')
      .attr('class', 'nodes');
    root.x0 = 0;
    root.y0 = 0;
    root.numericId = 0;
    let i = 1;
    if (root.children) {
      root.children.forEach(collapse);
    }
    function getTextWidth(text: string, fontSize: string = '8px', fontFamily: string = 'Roboto'): number {
      const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
      const context = canvas.getContext("2d");
      if (context) {
        context.font = `${fontSize} ${fontFamily}`;
        const metrics = context.measureText(text);
        return metrics.width;
      }
      return 0;
    }
    getTextWidth.canvas = null as any;
    function calculateMaxTextWidth(nodes: CustomHierarchyNode[]): number {
      let maxWidth = 0;
      nodes.forEach(node => {
        const lines = wrapText(node.data.name, 45);
        lines.forEach(line => {
          const width = getTextWidth(line, '10px', 'Roboto');
          if (width > maxWidth) {
            maxWidth = width;
          }
        });
      });
      return maxWidth;
    }
    update(root);
    return () => {
      svg.remove();
    };
    function collapse(d: CustomHierarchyNode) {
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
        d._children.forEach(collapse);
      }
    }
    function expand(d: CustomHierarchyNode) {
      if (d._children) {
        d.children = d._children;
        d._children = undefined;
        if (d.children) {
          d.children.forEach(child => collapse(child));
        }
      }
    }
    function wrapText(text: string, maxLength: number): string[] {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      words.forEach((word) => {
        if ((currentLine + word).length > maxLength) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        currentLine += `${word} `;
      });
      if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
      }
      return lines;
    }
    function highlightPath(node: CustomHierarchyNode) {
      gLink.selectAll('.link')
        .attr('stroke', '#555')
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.6);
      let current = node;
      while (current.parent) {
        const linkId = `link-${current.numericId}-${current.parent.numericId}`;
        const link = gLink.select(`#${linkId}`);
        if (!link.empty()) {
          link
            .attr('stroke', '#000000')
            .attr('stroke-width', 2.2)
            .attr('stroke-opacity', 1);
        }
        current = current.parent as CustomHierarchyNode;
      }
    }
    function update(source: CustomHierarchyNode) {
      const duration = 250;
      const nodes = root.descendants().reverse() as CustomHierarchyNode[];
      const links = root.links();
      treeLayout(root);
      const minX = d3.min(nodes, d => d.x) || 0;
      const maxX = d3.max(nodes, d => d.x) || 0;
      const minY = d3.min(nodes, d => d.y) || 0;
      const maxY = d3.max(nodes, d => d.y) || 0;
      const padding = 20;
      const maxTextWidth = calculateMaxTextWidth(nodes);
      const dynamicRightPadding = maxTextWidth + 60;
      const updatedMargin = { ...baseMargin, right: dynamicRightPadding };
      const requiredWidth = maxY + padding + updatedMargin.right;
      const requiredHeight = maxX - minX + padding;
      setContainerDimensions((currentDimensions) => {
        const newWidth = Math.max(currentDimensions.width, requiredWidth + updatedMargin.left + updatedMargin.right);
        const newHeight = Math.max(currentDimensions.height, requiredHeight + updatedMargin.top + updatedMargin.bottom);
        if (source._children || !source.children) {
          const adjustedWidth = Math.min(newWidth, currentDimensions.width);
          const adjustedHeight = Math.min(newHeight, currentDimensions.height);
          svg
            .attr('width', adjustedWidth)
            .attr('height', adjustedHeight)
            .attr('viewBox', `0 0 ${adjustedWidth} ${adjustedHeight}`);
          return { width: adjustedWidth, height: adjustedHeight };
        }
        svg
          .attr('width', newWidth)
          .attr('height', newHeight)
          .attr('viewBox', `0 0 ${newWidth} ${newHeight}`);
        return { width: newWidth, height: newHeight };
      });
      const verticalShift = Math.max(padding - minX, 0);
      gMain.transition()
        .duration(duration)
        .attr('transform', `translate(${updatedMargin.left},${updatedMargin.top + verticalShift})`);
      const nodeSelection = gNode
        .selectAll<SVGGElement, CustomHierarchyNode>('g.node')
        .data(nodes, (d: CustomHierarchyNode) => d.numericId || (d.numericId = i++));
      const nodeEnter = nodeSelection
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('id', (d) => `node-${d.numericId}`)
        .attr('transform', () => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);
      const circleRadius = 4;

nodeEnter
        .append('circle')
        .attr('r', circleRadius)
        .attr('fill', (d: CustomHierarchyNode) => {
          if (!d.children && !d._children) {
            return '#B0B0B0';
          } else if (d.depth > 1 && d.parent) {
            return d.parent.data.color || d.data.color || '#27306A';
          } else {
            return d.data.color || '#27306A';
          }
        })
        .attr('stroke-width', 1.2);
      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', (d: CustomHierarchyNode) => (d._children ? -(circleRadius + 4) : circleRadius + 4))
        .attr('text-anchor', (d: CustomHierarchyNode) => (d._children ? 'end' : 'start'))
        .style('font-size', '10px')
        .each(function (d: CustomHierarchyNode) {
          const maxLengthPerLine = 45;
          const lines = wrapText(d.data.name, maxLengthPerLine);
          const lineHeight = 1.2;
          lines.forEach((line: string, i: number) => {
            d3.select(this)
              .append('tspan')
              .attr('x', d._children ? -(circleRadius + 4) : circleRadius + 4)
              .attr('dy', i === 0 ? 0 : `${lineHeight}em`)
              .text(line);
          });
        })
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 1)
        .attr('stroke', 'white')
        .attr('paint-order', 'stroke');
      const nodesMerge = nodeSelection.merge(nodeEnter as any);
      nodesMerge.transition()
        .duration(duration)
        .attr('transform', (d: CustomHierarchyNode) => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);
      nodesMerge.on('click', (event: any, d: CustomHierarchyNode) => {
        event.stopPropagation();
        console.log(`Node clicked: ${d.data.name}`, d);
        if (d.children || d._children) {
          if (d.children) {
            d._children = d.children;
            d.children = undefined;
          } else {
            d.children = d._children;
            d._children = undefined;
            if (d.children) {
              d.children.forEach(child => collapse(child));
            }
          }
          update(d);
        }
        if (d.data.metadata) {
          setSelectedMetadata((prevMetadata: any) => {
            if (prevMetadata && prevMetadata.numericId === d.numericId) {
              return null;
            } else {
              return { ...d.data, numericId: d.numericId };
            }
          });
        } else {
          setSelectedMetadata(null);
        }
        highlightPath(d);
      });
      nodeSelection
        .exit()
        .transition()
        .duration(duration)
        .remove()
        .attr('transform', () => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);
      const linkSelection = gLink
        .selectAll<SVGPathElement, d3.HierarchyLink<CustomHierarchyNode>>('path.link')
        .data(links, (d: d3.HierarchyLink<CustomHierarchyNode>) => d.target.numericId!);
      const linkEnter = linkSelection
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('id', (d) => `link-${d.target.numericId}-${d.source.numericId}`)
        .attr('d', () => {
          const o = { x: source.x0!, y: source.y0! };
          return diagonal({ source: o, target: o } as d3.HierarchyPointLink<CustomHierarchyNode>);
        })
        .attr('stroke', '#555')
        .attr('stroke-width', 1.2);
      linkSelection.merge(linkEnter as any)
        .transition()
        .duration(duration)
        .attr('d', diagonal as any);
      linkSelection
        .exit()
        .transition()
        .duration(duration)
        .remove()
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o } as d3.HierarchyPointLink<CustomHierarchyNode>);
        });
      nodes.forEach((d: CustomHierarchyNode) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
  }, [isMounted]);
  return (
    <div
      className="tree-container-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <div
        className="tree-container"
        ref={treeContainerRef}
        style={{
          width: `${containerDimensions.width}px`,
          height: `${containerDimensions.height}px`,
          backgroundColor: '#F3F3F3',
          margin: '0',
          paddingRight: '20px',
          paddingLeft: '10px',
          boxSizing: 'border-box',
          transition: 'width 0.3s ease, height 0.3s ease',
        }}
      >
      </div>
      {selectedMetadata && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 1,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            backgroundColor: '#fff',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            padding: '20px',
            zIndex: 10,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            width: '350px',
            maxHeight: '60vh',
            overflowY: 'auto',
            fontFamily: '"Roboto", sans-serif',
            pointerEvents: 'auto',
          }}
        >
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Մետադատա</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Անուն:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Համակարգի անուն:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.metadata?.columnE || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Խմբավորման անուն:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.metadata?.columnK || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Իրավական հիմքեր:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.metadata?.columnF || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Գաղտնիություն:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.metadata?.columnG || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Ամբողջականություն:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.metadata?.columnH || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '8px' }}>Հասանելիություն:</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{selectedMetadata.metadata?.columnI || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
          <button
            onClick={() => setSelectedMetadata(null)}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#555',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}