import { type Plugin } from 'unified'
import type { Node } from 'unist'
import { kebabCase } from 'scule'
import { visit } from 'unist-util-visit'
import { parseFrontMatter } from './frontmatter'
import toMarkdown from './to-markdown'
import fromMarkdown from './from-markdown'
import syntax from './micromark-extension'
import type { RemarkMDCOptions } from './types'

const toFrontMatter = (yamlString: string) => `---\n${yamlString}\n---`

declare module 'unist' {
  interface Data {
    hName?: string
    hProperties?: Record<string, any>
  }
}

interface ChildrenNode extends Node {
  value?: unknown
  lang?: string
  meta?: string
}

interface ComponentNode extends Node {
  name?: string
  attributes?: Record<string, any>
  fmAttributes?: Record<string, any>
  rawData?: string
  children?: ChildrenNode[]
}

export default <Plugin<Array<RemarkMDCOptions>>> function remarkMDC (opts: RemarkMDCOptions = {}) {
  const data: Record<string, any> = this.data()

  add('micromarkExtensions', syntax())
  add('fromMarkdownExtensions', fromMarkdown(opts))
  add('toMarkdownExtensions', toMarkdown(opts))

  function add (field: string, value: any) {
    /* istanbul ignore if - other extensions. */
    if (!data[field]) {
      data[field] = []
    }

    data[field].push(value)
  }

  if (opts?.components?.length) {
    return async (tree: ComponentNode, { data }: { data: Record<string, any> }) => {
      const jobs: Promise<unknown>[] = []
      visit<ComponentNode, string[]>(tree, ['textComponent', 'leafComponent', 'containerComponent'], (node) => {
        bindNode(node)
        const { instance: handler, options } = opts.components!.find(c => c.name === node.name) || {}
        if (handler) {
          jobs.push(handler(options)(node, data))
        }
      })

      await Promise.all(jobs)
      return tree
    }
  }

  return (tree: ComponentNode) => {
    visit<ComponentNode, string[]>(tree, ['textComponent', 'leafComponent', 'containerComponent'], (node) => {
      bindNode(node)
    })
  }
}

function bindNode (node: ComponentNode) {
  const nodeData = node.data || (node.data = {})

  node.fmAttributes = getNodeData(node)

  nodeData.hName = kebabCase(node.name!)
  nodeData.hProperties = bindData(
    {
      ...node.attributes,
      // Parse data slots and retrieve data
      ...node.fmAttributes
    }
  )
}

function getNodeData (node: ComponentNode) {
  if (node.rawData) {
    const yaml = node.rawData.replace(/\s-+$/, '')
    const { data } = parseFrontMatter(toFrontMatter(yaml))
    return data
  }

  if (
    node.children?.length &&
    node.children[0].type === 'code' &&
    node.children[0].lang === 'yaml' &&
    node.children[0].meta === '[props]'
  ) {
    const yaml = node.children[0].value as string
    const { data } = parseFrontMatter(toFrontMatter(yaml))
    node.rawData = yaml + '\n---'
    node.children!.splice(0, 1)
    return data
  }

  return {}
}

function bindData (data: Record<string, any>) {
  const entries = Object.entries(data).map(([key, value]) => {
    if (key.startsWith(':')) {
      return [key, value]
    }
    if (typeof value === 'string') {
      return [key, value]
    }
    return [`:${key}`, JSON.stringify(value)]
  })
  return Object.fromEntries(entries)
}

export { stringifyFrontMatter, parseFrontMatter } from './frontmatter'
