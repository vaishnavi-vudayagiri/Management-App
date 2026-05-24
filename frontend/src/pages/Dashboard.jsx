import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Dashboard() {
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [invites, setInvites] = useState([]);
  const [boardName, setBoardName] = useState("");

  // ================= FETCH BOARDS =================
  async function fetchBoards() {
    try {
      const res = await API.get("/boards");

      setBoards(res.data);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to fetch boards"
      );
    }
  }

  // ================= FETCH INVITES =================
  async function fetchInvites() {
    try {
      const res = await API.get(
        "/boards/invites/me"
      );

      setInvites(res.data);
    } catch (err) {
      console.log("No invites");
    }
  }

  useEffect(() => {
    fetchBoards();
    fetchInvites();
  }, []);

  // ================= ACCEPT INVITE =================
  async function acceptInvite(boardId) {
    try {
      await API.post(
        `/boards/${boardId}/accept`
      );

      alert("Joined board successfully");

      fetchBoards();
      fetchInvites();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to accept invite"
      );
    }
  }

  // ================= CREATE BOARD =================
  async function createBoard(e) {
    e.preventDefault();

    if (!boardName.trim()) return;

    try {
      await API.post("/boards", {
        title: boardName,
        backgroundColor: "#2563eb",
      });

      setBoardName("");

      fetchBoards();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create board"
      );
    }
  }

  // ================= DELETE BOARD =================
  async function deleteBoard(id, isDefault) {
    if (isDefault) {
      alert(
        "Default boards cannot be deleted"
      );
      return;
    }

    try {
      await API.delete(`/boards/${id}`);

      fetchBoards();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete board"
      );
    }
  }

  // ================= LOGOUT =================
  async function logout() {
    try {
      await API.post("/auth/logout");

      localStorage.removeItem("user");

      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <div className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-slate-800">
          TaskFlow
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
        >
          Logout
        </button>

      </div>

      <div className="p-8">

        {/* Header */}
        <div className="mb-8">

          <h2 className="text-4xl font-bold text-slate-800">
            My Boards
          </h2>

          <p className="text-slate-500 mt-2">
            Manage all your project workspaces
          </p>

        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm mb-8">

            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Pending Invites
            </h2>

            <div className="space-y-4">

              {invites.map((board) => (

                <div
                  key={board._id}
                  className="border border-slate-200 rounded-xl p-4 flex justify-between items-center"
                >

                  <div>
                    <h3 className="font-bold text-slate-800">
                      {board.title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Invited by{" "}
                      {board.owner?.name}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      acceptInvite(board._id)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
                  >
                    Accept
                  </button>

                </div>

              ))}

            </div>

          </div>
        )}

        {/* Create Board */}
        <form
          onSubmit={createBoard}
          className="bg-white p-5 rounded-2xl shadow-sm flex gap-4 mb-10"
        >

          <input
            type="text"
            placeholder="Enter board name"
            value={boardName}
            onChange={(e) =>
              setBoardName(e.target.value)
            }
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
          >
            Create Board
          </button>

        </form>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {boards.map((board) => (

            <div
              key={board._id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition"
            >

              <Link
                to={`/board/${board._id}`}
              >
                <h3 className="text-2xl font-bold text-slate-800 hover:text-blue-600">
                  {board.title}
                </h3>
              </Link>

              <p className="text-slate-500 mt-3">
                Project workspace board
              </p>

              {board.isDefault && (
                <p className="text-green-600 font-semibold mt-2">
                  Default Board
                </p>
              )}

              {!board.isDefault && (
                <button
                  onClick={() =>
                    deleteBoard(
                      board._id,
                      board.isDefault
                    )
                  }
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
                >
                  Delete Board
                </button>
              )}

            </div>

          ))}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;