import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
 
const SortableNoteItem = ({ note, id, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      className="note-item"
    >
      <div className="note-content">
        <p>{note.content}</p>
        <div className="note-meta">
          <span className="note-date">{note.date}</span>
          <span className="note-time">{note.time}</span>
          <button
            type="button"
            className="note-delete-button"
            onClick={(e) => {
              e.stopPropagation();
              // Request deletion via parent (parent will show custom modal)
              if (onDelete) onDelete(id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Delete note"
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableNoteItem;