Certainly! Below is a complete implementation of the `CodeView` component in TypeScript, which displays the read-only code view with syntax highlighting and block-to-line mapping functionality.

```typescript
import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

interface CodeViewProps {
  code: string;
  blockToLineMapping: Record<string, number[]>;
  onBlockClick?: (blockId: string) => void;
}

const CodeView: React.FC<CodeViewProps> = ({ code, blockToLineMapping, onBlockClick }) => {
  const [highlightedCode, setHighlightedCode] = useState<string>(code);

  useEffect(() => {
    // Highlight the code using highlight.js
    const highlighted = hljs.highlightAuto(code).value;
    setHighlightedCode(highlighted);
  }, [code]);

  const handleLineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'CODE') {
      const lineNumbers = Array.from(target.closest('pre').querySelectorAll('.hljs-ln-numbers .hljs-ln-line'));
      const lineNumber = parseInt(lineNumbers.indexOf(target) + 1, 10);

      for (const blockId in blockToLineMapping) {
        if (blockToLineMapping[blockId].includes(lineNumber)) {
          onBlockClick?.(blockId);
          break;
        }
      }
    }
  };

  return (
    <div
      className="code-view"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      onClick={handleLineClick}
    />
  );
};

export default CodeView;
```

### Explanation:

1. **Props**:
   - `code`: The raw code string to be displayed.
   - `blockToLineMapping`: A mapping from block IDs to line numbers in the code.
   - `onBlockClick`: An optional callback function that is called when a block is clicked.

2. **State**:
   - `highlightedCode`: Stores the highlighted version of the code string.

3. **Effect Hook**:
   - Uses `useEffect` to highlight the code using `highlight.js` and update the state with the highlighted HTML.

4. **Event Handler**:
   - `handleLineClick`: Handles clicks on lines in the code view. It determines which line was clicked, maps it back to a block ID using the `blockToLineMapping`, and calls the `onBlockClick` callback if provided.

5. **Rendering**:
   - Uses `dangerouslySetInnerHTML` to render the highlighted HTML.
   - Attaches the `handleLineClick` event handler to the code view container to handle line clicks.

### Usage Example:

```typescript
import React from 'react';
import CodeView from './CodeView';

const MyComponent = () => {
  const code = `
    <div>
      <h1>Hello World</h1>
      <p>This is a sample block.</p>
    </div>
  `;

  const blockToLineMapping: Record<string, number[]> = {
    'block-1': [2],
    'block-2': [3]
  };

  return (
    <CodeView
      code={code}
      blockToLineMapping={blockToLineMapping}
      onBlockClick={(blockId) => console.log(`Block clicked: ${blockId}`)}
    />
  );
};

export default MyComponent;
```

This component can be integrated into your application to provide a read-only code view with syntax highlighting and interactive line-to-block mapping.