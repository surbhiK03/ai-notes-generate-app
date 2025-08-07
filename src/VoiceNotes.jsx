import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./VoiceNotes.css";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

const apiKey = "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";

// Local Storage Keys
const STORAGE_KEYS = {
  NOTES: "voice-notes-app-notes",
};

// Drop Zone Component
const NotesDropZone = ({ children, isOver }) => {
  const { setNodeRef } = useDroppable({
    id: "notes-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`notes-list-container ${isOver ? "drop-active" : ""}`}
      data-over={isOver}
    >
      {children}
    </div>
  );
};

// Sortable Note Item Component
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
    transform: CSS.Transform.toString(transform),
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

// Draggable Generated Note Component
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
    transform: CSS.Transform.toString(transform),
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

const VoiceNotes = () => {
  const [transcript, setTranscript] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const recognitionRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allNotes, setAllNotes] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const storedNotes = localStorage.getItem("notes-list");
    if (storedNotes) {
      setAllNotes(JSON.parse(storedNotes));
    }
    setNotesLoading(false);
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      console.log("spokenText", spokenText);
      fetchNoteFromPerplexity(spokenText);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const fetchNoteFromPerplexity = async (text) => {
    setLoading(true);
    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar", // or 'sonar-pro'
          messages: [
            {
              role: "system",
              content:
                "You are an assistant that converts voice to short helpful notes.",
            },
            {
              role: "user",
              content: `Convert this spoken text into a note: ${text}`,
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("data", data);
      const generatedNote = data.choices?.[0]?.message.content || "No response";

      setNote(generatedNote);
    } catch (error) {
      console.error("Error:", error);
      setNote("Failed to fetch note.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setIsOverDropZone(over?.id === "notes-drop-zone");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setIsOverDropZone(false);

    if (
      active.id === "generated-note" &&
      over &&
      over.id === "notes-drop-zone"
    ) {
      // Add the generated note to the notes list
      const newNote = {
        id: Date.now().toString(),
        content: note,
        originalText: transcript,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      setNote(""); // Clear the generated note
      setTranscript(""); // Clear the transcript
    } else if (active.id !== over?.id && over?.id !== "notes-drop-zone") {
      // Reorder existing notes
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    console.log("notes", notes);
    if (notes.length > 0) {
      localStorage.setItem("notes-list", JSON.stringify(notes));
    }
  }, [notes]);

 useEffect(() => {
  const formattedDate = selectedDate.toLocaleDateString('en-GB'); // "dd/mm/yyyy"
  const filtered = allNotes.filter(note => note.date === formattedDate);
  setNotes(filtered);
}, [selectedDate, allNotes]);

  return (
    <div className="voice-notes-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="voice-notes-layout">
          {/* Left Section - Recording */}
          <div className="recording-section">
            <div className="voice-notes-card">
              <div className="header">
                <div className="logo">
                  <div className="microphone-icon">🎤</div>
                </div>
                <h1 className="title">Voice to Note</h1>
                <p className="subtitle">
                  Speak naturally and get organized notes instantly
                </p>
              </div>

              <div className="controls">
                <button
                  className={`record-button ${isRecording ? "recording" : ""}`}
                  onClick={startListening}
                  disabled={isRecording}
                >
                  <div className="button-content">
                    <div className="button-icon">
                      {isRecording ? "⏹️" : "🎤"}
                    </div>
                    <span className="button-text">
                      {isRecording ? "Recording..." : "Start Speaking"}
                    </span>
                  </div>
                  {isRecording && <div className="recording-indicator"></div>}
                </button>
              </div>

              {transcript && (
                <div className="transcript-section">
                  <div className="section-header">
                    <span className="section-icon">💬</span>
                    <h3>You Said</h3>
                  </div>
                  <div className="transcript-content">
                    <p>{transcript}</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Processing your voice...</p>
                </div>
              )}

              {note && !loading && (
                <div className="note-section">
                  <DraggableGeneratedNote
                    note={note}
                    onDragStart={handleDragStart}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Notes List */}
          <div className="notes-section">
            <div className="notes-card">
              {/* 🗓️ Add Calendar Here */}
              <div
                className="calendar-container"
                style={{ marginBottom: "1rem" }}
              >
                <Calendar onChange={setSelectedDate} value={selectedDate} />
              </div>
              <h2>Your Notes</h2>

              <NotesDropZone isOver={isOverDropZone}>
                {notesLoading ? (
                  <div className="loading-notes">
                    <div className="loading-spinner"></div>
                    <p>Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="empty-notes">
                    <div className="empty-icon">📝</div>
                    <p>No notes yet. Drag generated notes here to save them!</p>
                  </div>
                ) : (
                  <SortableContext
                    items={notes.map((note) => note.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="notes-list">
                      {notes.map((note) => (
                        <SortableNoteItem
                          key={note.id}
                          id={note.id}
                          note={note}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </NotesDropZone>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId === "generated-note" && note ? (
            <div className="drag-overlay">
              <div className="section-header">
                <span className="section-icon">📝</span>
                <h3>Generated Note</h3>
              </div>
              <div className="note-content">
                <p>{note}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default VoiceNotes;
