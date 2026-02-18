import React, { useState, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CanvasBlock } from './CanvasBlock';
import { BlockPalette } from './BlockPalette';
import { PropertyPanel } from './PropertyPanel';

interface CanvasContainerProps {
  blocks: any[];
  onBlocksChange: (blocks: any[]) => void;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ blocks, onBlocksChange }) => {
  const [activeId, setActiveId] = useState(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  }, []);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id && over) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onBlocksChange(newBlocks);
    }
  };

  const style = (activeId: any) => ({
    transition: 'transform 0.2s ease-in-out',
  });

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        className="relative w-full h-full bg-white border-2 border-gray-300 focus:outline-none"
        tabIndex={0}
        role="application"
        aria-label="Canvas Area"
      >
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <CanvasBlock key={block.id} id={block.id} block={block} />
          ))}
        </SortableContext>
      </div>

      <PropertyPanel activeId={activeId} />

      <BlockPalette onAddBlock={(newBlock: any) => {
        const updatedBlocks = [...blocks, newBlock];
        onBlocksChange(updatedBlocks);
      }} />
    </DndContext>
  );
};

export default CanvasContainer;