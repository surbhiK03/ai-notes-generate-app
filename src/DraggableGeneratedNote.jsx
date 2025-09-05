import { useSortable } from "@dnd-kit/sortable";

const DraggableGeneratedNote = ({ note, onDragStart }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: "generated-note",
    data: {
      type: "generated-note",
      content: note,
    },
  });

  const style = {
    transform: CSS.Transform?.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="generated-note-draggable"
    >
      <div className="section-header">
        <span className="section-icon">📝</span>
        <h3>Generated Note</h3>
        <span className="drag-hint">↕️ Drag to save</span>
      </div>
      <div className="note-content">
        <p>{note}</p>
      </div>
    </div>
  );
};

export default DraggableGeneratedNote;