import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TreeNode {
  name: string
  attributes?: Record<string, string | number | boolean>
  children?: TreeNode[]
  metadata?: any
  color?: any
  isExpanded?: boolean
}

export const filterNodes = (
  node: TreeNode,
  searchTerm: string
): TreeNode | null => {
  let matches = false

  if (
    node.name &&
    typeof node.name === 'string' &&
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) {
    matches = true
  }

  const filteredChildren = node.children
    ?.map(child => filterNodes(child, searchTerm))
    .filter(child => child !== null) as TreeNode[] | undefined

  if (filteredChildren && filteredChildren.length > 0) {
    matches = true
  }

  const newNode = { ...node, children: filteredChildren }

  if (matches) {
    return { ...newNode, isExpanded: true }
  }

  return null
}

export const getFilteredTreeData = (
  rootNode: TreeNode,
  searchTerm: string
): TreeNode | null => {
  return filterNodes(rootNode, searchTerm)
}

export const updateExpandedNodes = (node: TreeNode | null) => {
  if (!node) return

  const traverse = (n: TreeNode) => {
    if (n.isExpanded) {
      // setExpandedNodes(prev => new Set(prev.add(n.name)))
    }
    n.children?.forEach(traverse)
  }

  traverse(node)
}
