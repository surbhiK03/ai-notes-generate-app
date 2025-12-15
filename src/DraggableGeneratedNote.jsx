import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
 
const DraggableGeneratedNote = ({ id = "generated-note", note, onDragStart }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "generated-note",
      content: note,
    },
  });
 
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
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