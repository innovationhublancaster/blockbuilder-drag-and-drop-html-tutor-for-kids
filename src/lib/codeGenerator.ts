Certainly! Below is a sample implementation of `src/lib/codeGenerator.ts`. This module includes a deterministic function to generate HTML from a block structure and produce line mappings used by the CodeView component.

```typescript
// src/lib/codeGenerator.ts

/**
 * Generates HTML code from blocks and provides line mappings for each block.
 */

import { Block } from '../types/block';

interface LineMapping {
  blockId: string;
  startLine: number;
  endLine: number;
}

function generateHTML(blocks: Block[]): { html: string, lineMappings: LineMapping[] } {
  const lines: string[] = [];
  const lineMappings: LineMapping[] = [];

  blocks.forEach((block, index) => {
    const blockLines = generateBlockCode(block);
    lines.push(...blockLines);

    // Determine the start and end lines for this block
    const startLine = lines.length - blockLines.length + 1;
    const endLine = lines.length;

    lineMappings.push({
      blockId: block.id,
      startLine,
      endLine
    });
  });

  return {
    html: lines.join('\n'),
    lineMappings
  };
}

function generateBlockCode(block: Block): string[] {
  switch (block.type) {
    case 'text':
      return [`<p>${block.content}</p>`];
    case 'image':
      return [`<img src="${block.url}" alt="${block.altText || ''}">`];
    case 'heading':
      return [`<h${block.level}>${block.content}</h${block.level}>`];
    case 'link':
      return [`<a href="${block.url}">${block.text}</a>`];
    // Add more block types as needed
    default:
      throw new Error(`Unsupported block type: ${block.type}`);
  }
}

export { generateHTML, LineMapping };
```

### Explanation:

1. **Imports and Types**:
   - The module imports a `Block` type from a hypothetical `../types/block` file.
   - A `LineMapping` interface is defined to map blocks to their corresponding lines in the generated HTML.

2. **generateHTML Function**:
   - This function takes an array of `Block` objects and generates HTML content along with line mappings.
   - It iterates over each block, generates its HTML representation using `generateBlockCode`, and records the start and end lines for each block.
   - The generated HTML is joined into a single string, and both the HTML and line mappings are returned.

3. **generateBlockCode Function**:
   - This helper function takes a single `Block` object and returns its HTML representation as an array of strings (each string represents one line of HTML).
   - It uses a switch statement to handle different block types (`text`, `image`, `heading`, `link`). You can extend this function to support additional block types as needed.
   - If an unsupported block type is encountered, it throws an error.

### Usage Example:

```typescript
import { generateHTML } from './lib/codeGenerator';

const blocks: Block[] = [
  {
    id: '1',
    type: 'text',
    content: 'Hello, World!'
  },
  {
    id: '2',
    type: 'image',
    url: '/path/to/image.jpg',
    altText: 'Sample Image'
  }
];

const { html, lineMappings } = generateHTML(blocks);

console.log(html);
// Output:
// <p>Hello, World!</p>
// <img src="/path/to/image.jpg" alt="Sample Image">

console.log(lineMappings);
// Output:
// [
//   { blockId: '1', startLine: 1, endLine: 1 },
//   { blockId: '2', startLine: 3, endLine: 3 }
// ]
```

This module can be extended to support additional block types and more complex HTML generation as needed.