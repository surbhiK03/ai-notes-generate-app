import { useSortable } from "@dnd-kit/sortable";

const SortableNoteItem = ({ note, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      className="note-item"
    >
      <div className="note-content">
        <p>{note.content}</p>
        <div className="note-meta">
          <span className="note-date">{note.date}</span>
          <span className="note-time">{note.time}</span>
        </div>
      </div>
    </div>
  );
};

export default SortableNoteItem;
