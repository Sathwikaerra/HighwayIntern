import React, { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { user, token } = useSelector((state) => state.user);

  const [notes, setNotes] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [noteContent, setNoteContent] = useState("");
 

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/getnotes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data.notes || []); // ✅ fallback
    } catch (err) {
      console.error("Failed to fetch notes", err);
      setNotes([]); // ✅ fallback on error
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/add",
        { content: noteContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(res.data.notes || []); // ✅ fallback
      setNoteContent("");
      setShowInput(false);
    } catch (err) {
      console.error("Error adding note", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/auth/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes(res.data.notes || []); // ✅ fallback
    } catch (err) {
      console.error("Error deleting note", err);
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    nav("/");
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [notes]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-8 md:py-10 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 mb-6">
          <img src="/icon.png" alt="HD Logo" className="w-9 h-9" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-sm font-bold md:p-3 md:text-lg text-white p-2 rounded-2xl"
        >
          Logout
        </button>
      </div>

      {/* Welcome Card */}
      <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col justify-center items-center mb-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">
          Welcome, {user.name}!
        </h2>
        <p className="text-sm text-gray-500 mt-1">Email: {user.email}</p>
      </div>

      {/* Create Note Button */}
      <div className="mb-6 text-center block">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="w-full md:w-[300px] text-center m-auto bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Create Note
          </button>
        ) : (
          <div className="w-full md:w-[400px] mx-auto flex flex-col items-center space-y-3">
            <input
              type="text"
              placeholder="Write your note here..."
              className="w-full border px-3 py-2 rounded-md text-gray-800"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddNote}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNoteContent("");
                  setShowInput(false);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex justify-between items-center bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3"
            >
              <span className="text-gray-800">{note.content}</span>
              <button
                className="text-gray-600 hover:text-red-500"
                onClick={() => handleDelete(note.id)}
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
