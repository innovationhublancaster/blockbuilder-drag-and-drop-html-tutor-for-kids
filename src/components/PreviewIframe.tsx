Here's a complete implementation of the `PreviewIframe` component in TypeScript, which renders the secure preview iframe with necessary security configurations and communication setup:

```typescript
import React, { useEffect, useState } from 'react';
import { usePostMessage } from './usePostMessage'; // Assuming you have a custom hook for postMessage

interface PreviewIframeProps {
  srcdoc: string;
}

const PreviewIframe: React.FC<PreviewIframeProps> = ({ srcdoc }) => {
  const [isReady, setIsReady] = useState(false);
  const { sendMessage, onMessage } = usePostMessage();

  useEffect(() => {
    // Listen for messages from the iframe
    onMessage((event) => {
      if (event.data.type === 'preview_ready') {
        setIsReady(true);
      }
    });
  }, [onMessage]);

  // Function to handle sending updates to the iframe
  const sendUpdate = () => {
    sendMessage({
      type: 'update_content',
      srcdoc,
    });
  };

  useEffect(() => {
    // Send an initial update when srcdoc changes
    if (isReady) {
      sendUpdate();
    }
  }, [srcdoc, isReady]);

  return (
    <iframe
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcdoc}
      title="Preview"
      style={{ width: '100%', height: '600px', border: 'none' }}
      onLoad={() => {
        sendMessage({
          type: 'handshake',
        });
      }}
    />
  );
};

export default PreviewIframe;
```

### Explanation:

1. **Props**: The `PreviewIframe` component takes a single prop, `srcdoc`, which is the HTML content to be rendered inside the iframe.

2. **State Management**:
   - `isReady`: A boolean state to track whether the iframe has indicated it's ready to receive updates.

3. **PostMessage Hook**: 
   - The component uses a custom hook `usePostMessage` for sending and receiving messages with the iframe. This hook should handle the creation and handling of the postMessage events.

4. **Effect Hooks**:
   - An effect hook is used to listen for messages from the iframe. When it receives a message indicating that the preview is ready (`preview_ready`), it sets `isReady` to true.
   - Another effect hook sends an initial update to the iframe when `srcdoc` changes and the iframe is ready.

5. **Iframe Configuration**:
   - The iframe is configured with a sandbox attribute to restrict its capabilities. Here, only scripts and the same-origin policy are allowed.
   - The `onLoad` event handler sends a handshake message to the iframe when it loads, allowing for initial setup communication.

6. **Styling**:
   - Basic styling is applied to make the iframe take up the full width of its container and have a fixed height.

This implementation assumes you have a custom hook `usePostMessage` that manages sending and receiving postMessages with the iframe. If not, you'll need to implement or adapt this logic accordingly.