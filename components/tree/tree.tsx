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
      .attr('viewBox', `0 0 ${containerDimensions.width} ${containerDimensions.height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('font-size', '8px')
      .style('user-select', 'none');

    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#f3f3f3');

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

    function getTextWidth(
      text: string,
      fontSize: string = '8px',
      fontFamily: string = 'Roboto'
    ): number {
      const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
      const context = canvas.getContext('2d');
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
      nodes.forEach((node) => {
        const lines = wrapText(node.data.name, 45);
        lines.forEach((line) => {
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
          d.children.forEach((child) => collapse(child));
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
      gLink
        .selectAll('.link')
        .attr('stroke', '#555')
        .attr('stroke-width', 1.2)
        .attr('stroke-opacity', 0.6);

      let current = node;
      while (current.parent) {
        const linkId = `link-${current.numericId}-${current.parent.numericId}`;
        const link = gLink.select(`#${linkId}`);

        if (!link.empty()) {
          link.attr('stroke', '#000000').attr('stroke-width', 2.2).attr('stroke-opacity', 1);
        }

        current = current.parent as CustomHierarchyNode;
      }
    }

    function update(source: CustomHierarchyNode) {
      const duration = 250;
      const nodes = root.descendants().reverse() as CustomHierarchyNode[];
      const links = root.links();

      treeLayout(root);

      const minX = d3.min(nodes, (d) => d.x) || 0;
      const maxX = d3.max(nodes, (d) => d.x) || 0;
      const minY = d3.min(nodes, (d) => d.y) || 0;
      const maxY = d3.max(nodes, (d) => d.y) || 0;

      const padding = 20;

      const maxTextWidth = calculateMaxTextWidth(nodes);
      const dynamicRightPadding = maxTextWidth + 60;

      const updatedMargin = { ...baseMargin, right: dynamicRightPadding };

      const requiredWidth = maxY + padding + updatedMargin.right;
      const requiredHeight = maxX - minX + padding;

      // Adjust the container dimensions dynamically
      setContainerDimensions({
        width: requiredWidth + updatedMargin.left + updatedMargin.right,
        height: requiredHeight + updatedMargin.top + updatedMargin.bottom,
      });

      svg
        .attr('width', requiredWidth + updatedMargin.left + updatedMargin.right)
        .attr('height', requiredHeight + updatedMargin.top + updatedMargin.bottom)
        .attr('viewBox', `0 0 ${requiredWidth + updatedMargin.left + updatedMargin.right} ${requiredHeight + updatedMargin.top + updatedMargin.bottom}`);

      const verticalShift = Math.max(padding - minX, 0);

      gMain
        .transition()
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
            return '#b0b0b0';
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

      nodesMerge
        .transition()
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
              d.children.forEach((child) => collapse(child));
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

      linkSelection
        .merge(linkEnter as any)
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

  const metaKeysMap = {
    columnE: 'Համակարգի անուն',
    columnF: 'Իրավական հիմքեր',
    columnG: 'Գաղտնիություն',
    columnH: 'Ամբողջականություն',
    columnI: 'Հասանելիություն',
    columnJ: 'Վավերականություն',
    columnK: 'Խմբավորման անուն',
  };

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
          width: '100%',
          height: '100%',
          backgroundColor: '#f3f3f3',
          margin: '0',
          paddingRight: '20px',
          paddingLeft: '10px',
          boxSizing: 'border-box',
          transition: 'width 0.3s ease, height 0.3s ease',
        }}
      ></div>
      {selectedMetadata && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedMetadata(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              width: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              fontFamily: '"Roboto", sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '15px', textAlign: 'center', fontSize: '24px' }}>Մետադատա</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
              <tbody>
                {Object.entries(selectedMetadata.metadata || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      style={{
                        fontWeight: 'bold',
                        borderBottom: '1px solid #ddd',
                        padding: '12px',
                      }}
                    >
                      {metaKeysMap[key] || key}:
                    </td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: '12px' }}>
                      {value || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setSelectedMetadata(null)}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#555',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
