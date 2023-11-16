import { describe, expect } from 'vitest'
import { runMarkdownTests } from './utils'

describe('block-component', () => {
  runMarkdownTests({
    empty: {
      markdown: '::component\n::',
      expected: '::component\n::'
    },
    text: {
      markdown: '::component\ntext\n::',
      expected: '::component\ntext\n::'
    },
    'empty-slot': {
      markdown: '::component\n#text\n::',
      expected: '::component\n#text\n::'
    },
    frontmatter: {
      markdown: '::with-frontmatter\n---\nkey: value\narray:\n  - item\n  - itemKey: value\n---\n::'
    },
    frontmatter1: {
      markdown: [
        '::with-frontmatter',
        '---',
        'key: value',
        'key2:',
        '  subkey: value',
        '  subkey2: value',
        'array:',
        '  - item',
        '  - itemKey: value',
        '---',
        '::'
      ].join('\n'),
      expected: [
        '::with-frontmatter',
        '---',
        'key: value',
        'key2.subkey: value',
        'key2.subkey2: value',
        'array:',
        '  - item',
        '  - itemKey: value',
        '---',
        '::'
      ].join('\n')
    },
    frontmatterYaml: {
      markdown: '::with-frontmatter\n```yaml\nkey: value\narray:\n  - item\n  - itemKey: value\n```\n::',
      mdcOptions: {
        experimental: {
          componentCodeBlockProps: true
        }
      }
    },
    frontmatterYaml1: {
      markdown: [
        '::with-frontmatter',
        '```yaml',
        'key: value',
        'key2:',
        '  subkey: value',
        '  subkey2: value',
        'array:',
        '  - item',
        '  - itemKey: value',
        '```',
        '::'
      ].join('\n'),
      expected: [
        '::with-frontmatter',
        '```yaml',
        'key: value',
        'key2.subkey: value',
        'key2.subkey2: value',
        'array:',
        '  - item',
        '  - itemKey: value',
        '```',
        '::'
      ].join('\n'),
      mdcOptions: {
        experimental: {
          componentCodeBlockProps: true
        }
      }
    },
    'nested-component-yaml': {
      markdown: [
        '::with-frontmatter-and-nested-component',
        '```yaml',
        'key: value',
        'array:',
        '  - item',
        '  - itemKey: value',
        '```',
        'Default slot',
        '',
        '#secondary-slot',
        'Secondary slot value',
        '',
        '  :::hello',
        '  ```yaml',
        '  key: value',
        '  ```',
        '  :::',
        '::'
      ].join('\n'),
      mdcOptions: {
        experimental: {
          componentCodeBlockProps: true
        }
      }
    },
    'nested-component': {
      markdown: [
        '::with-frontmatter-and-nested-component',
        '---',
        'key: value',
        'array:',
        '  - item',
        '  - itemKey: value',
        '---',
        'Default slot',
        '',
        '#secondary-slot',
        'Secondary slot value',
        '',
        '  :::hello',
        '  ---',
        '  key: value',
        '  ---',
        '  :::',
        '::'
      ].join('\n')
    },
    'section-order': {
      markdown: [
        '::comp',
        '#title',
        'Hello',
        '#another-title',
        'World',
        '#default',
        'P1',
        '',
        'P2',
        '',
        'P',
        '::'
      ].join('\n'),
      expected: [
        '::comp',
        'P1',
        '',
        'P2',
        '',
        'P',
        '',
        '#title',
        'Hello',
        '',
        '#another-title',
        'World',
        '::'
      ].join('\n')
    },
    'section-order-2': {
      markdown: [
        '::comp',
        '#a',
        'A',
        '#c',
        'C',
        '#b',
        'B',
        '#default',
        'P1',
        '::'
      ].join('\n'),
      expected: [
        '::comp',
        'P1',
        '',
        '#a',
        'A',
        '',
        '#c',
        'C',
        '',
        '#b',
        'B',
        '::'
      ].join('\n')
    },
    'ignore-code-fence': {
      markdown: [
        '::component',
        'First line',
        '',
        '```cpp',
        '#include <iostream>',
        '```',
        '',
        'Second line',
        '::',
        '',
        'Third line'
      ].join('\n')
    },
    'danglig-list': {
      markdown: [
        '::component',
        '-   list item',
        '-   list item',
        '',
        '#slot',
        'slot content',
        '::'
      ].join('\n')
    },
    'trim-slot-name': {
      markdown: [
        '::component',
        '#slot ',
        'slot content',
        '::'
      ].join('\n'),
      expected: [
        '::component',
        '#slot',
        'slot content',
        '::'
      ].join('\n')
    },
    'sugar-syntax': {
      markdown: [
        ':component'
      ].join('\n'),
      extra: (_md, ast) => {
        expect(ast.children[0].type).toBe('textComponent')
        expect(ast.children[0].name).toBe('component')
      }
    }
  })
})
