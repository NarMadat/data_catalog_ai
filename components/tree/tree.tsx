import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import initialData from '@/data/data.json';

interface CustomHierarchyNode extends d3.HierarchyNode<any> {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  id?: string | number;
  _children?: CustomHierarchyNode[];
  children?: CustomHierarchyNode[];
  data: any;
}

export function DataTree() {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const gMainRef = useRef<SVGGElement>(null);
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const margin = { top: 20, right: 100, bottom: 20, left: 40 };
  const width = 1800;
  const height =
    typeof window !== 'undefined'
      ? window.innerHeight - margin.top - margin.bottom - 200
      : 800;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!treeContainerRef.current) return;

    const root = d3.hierarchy(initialData) as CustomHierarchyNode;
    const dx = 60;
    const dy = 500;

    const treeLayout = d3.tree<CustomHierarchyNode>().nodeSize([dx, dy]);

    const diagonal = d3
      .linkHorizontal<{}, d3.HierarchyPointNode<{}>>()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    const svg = d3
      .select(treeContainerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('font-size', '12px')
      .style('user-select', 'none');

    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#f3f3f3');

    const gMain = svg.append('g').attr('class', 'main-group');
    gMainRef.current = gMain.node() as SVGGElement;

    const gLink = gMain
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('class', 'links');

    const gNode = gMain
      .append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all')
      .attr('class', 'nodes');

    root.x0 = dx;
    root.y0 = 0;

    root.id = 0;
    let i = 1;

    if (root.children) {
      root.children.forEach(collapse);
    }

    update(root);

    return () => {
      svg.remove();
    };

    function collapse(d: CustomHierarchyNode) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
        d._children.forEach(collapse);
      }
    }

    function expand(d: CustomHierarchyNode) {
      if (d._children) {
        d.children = d._children;
        d._children = null;
        if (d.children) {
          d.children.forEach(child => collapse(child));
        }
      }
    }

    function wrapText(text: string, maxLength: number) {
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
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6);

      let current = node;
      while (current.parent) {
        const linkId = `link-${current.id}-${current.parent.id}`;
        const link = gLink.select(`#${linkId}`);

        if (!link.empty()) {
          link
            .attr('stroke', '#000000')
            .attr('stroke-width', 2.5)
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

      let left = root;
      let right = root;
      root.eachBefore((node: CustomHierarchyNode) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const adjustedHeight = right.x - left.x + margin.top + margin.bottom;

      svg.transition()
        .duration(duration)
        .attr('viewBox', [
          0,
          left.x - margin.top,
          width,
          adjustedHeight,
        ]);

      const nodeSelection = gNode
        .selectAll<SVGGElement, CustomHierarchyNode>('g.node')
        .data(nodes, (d: any) => d.id || (d.id = i++));

      const nodeEnter = nodeSelection
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('id', (d) => `node-${d.id}`)
        .attr('transform', () => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      const circleRadius = 8;

      nodeEnter
        .append('circle')
        .attr('r', circleRadius)
        .attr('fill', (d: CustomHierarchyNode) => {
          if (!d.children && !d._children) {
            return '#b0b0b0';
          } else if (d.depth > 1 && d.parent) {
            d.data.color = d.parent.data.color || d.data.color || '#27306A';
            return d.data.color;
          } else {
            return d.data.color || '#27306A';
          }
        })
        .attr('stroke-width', 2);

      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', (d: CustomHierarchyNode) => (d._children ? -(circleRadius + 4) : circleRadius + 4))
        .attr('text-anchor', (d: CustomHierarchyNode) => (d._children ? 'end' : 'start'))
        .style('font-size', '16px')
        .each(function (d: CustomHierarchyNode) {
          const maxLengthPerLine = 50;
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
        .attr('stroke-width', 2)
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
        console.log(`Node clicked: ${d.data.name}`, d);

        if (d.children || d._children) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
            d.children.forEach(child => collapse(child));
          }

          update(d);
        }

        if (d.data.metadata) {
          setSelectedMetadata((prevMetadata: any) => {
            if (prevMetadata && prevMetadata.id === d.id) {
              return null;
            } else {
              return { ...d.data, id: d.id };
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
        .data(links, (d: any) => d.target.id);

      const linkEnter = linkSelection
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('id', (d) => `link-${d.target.id}-${d.source.id}`)
        .attr('d', () => {
          const o = { x: source.x0!, y: source.y0! };
          return diagonal({ source: o, target: o } as any);
        })
        .attr('stroke', '#555')
        .attr('stroke-width', 1.5);

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
          const o = { x: source.x!, y: source.y! };
          return diagonal({ source: o, target: o } as any);
        });

      nodes.forEach((d: CustomHierarchyNode) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function showMetadata(data: any, nodeId: string | number) {
      setSelectedMetadata({ ...data, id: nodeId });
    }
  }, [isMounted, height, margin.left, margin.right, margin.top, margin.bottom, width]);

  return (
    <div
      className="tree-container"
      ref={treeContainerRef}
      style={{
        width: '78.5vw',
        height: '95vh',
        position: 'relative',
        backgroundColor: '#f3f3f3',
        margin: '0',
        paddingRight: '50px',
        paddingLeft: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {selectedMetadata && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: selectedMetadata ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.9)',
            opacity: selectedMetadata ? 1 : 0,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            zIndex: 10,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            width: '400px',
            maxHeight: '70vh',
            overflowY: 'auto',
            fontFamily: '"Roboto", sans-serif',
            pointerEvents: selectedMetadata ? 'auto' : 'none',
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
              padding: '10px 20px',
              backgroundColor: '#555',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
