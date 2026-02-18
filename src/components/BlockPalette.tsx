import React, { useState } from 'react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableProps } from './types';

const BlockPalette: React.FC = () => {
  const [blocks] = useState([
    { id: '1', type: 'text' },
    { id: '2', type: 'image' },
    { id: '3', type: 'color' },
    { id: '4', type: 'font-size' }
  ]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="block-palette">
        {blocks.map((block) => (
          <Block key={block.id} {...block} />
        ))}
      </div>
    </DndProvider>
  );
};

const Block: React.FC<DraggableProps> = ({ id, type }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type, id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      className={`block ${isDragging ? 'dragging' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </div>
  );
};

export default BlockPalette;
```

This file defines a `BlockPalette` component that contains draggable blocks for the editor. Each block is represented by a `Block` component, which uses `react-dnd` to make the blocks draggable. The styles and classes are placeholders and should be replaced with actual CSS for styling.