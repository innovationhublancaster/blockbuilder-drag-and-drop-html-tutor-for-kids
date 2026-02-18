import { useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface UseDragDropProps {
  id: string;
}

const useDragDrop = ({ id }: UseDragDropProps) => {
  const [isOver, setIsOver] = useState(false);

  const { setNodeRef, isDraggingOver } = useDroppable({
    id,
    onDragEnter: () => setIsOver(true),
    onDragLeave: () => setIsOver(false),
  });

  const handleDrop = useCallback((event) => {
    // Handle drop logic here
    console.log('Dropped item:', event);
  }, []);

  return {
    setNodeRef,
    isDraggingOver,
    isOver,
    handleDrop,
  };
};

export default useDragDrop;