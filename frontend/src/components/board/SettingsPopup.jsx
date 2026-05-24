import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

function SettingsPopup({ board, boardId, setShowSettings, fetchBoardData }) {
    const navigate = useNavigate();

    const [title, setTitle] = useState(board?.title || "");
    const [backgroundColor, setBackgroundColor] = useState(
        board?.backgroundColor || "#2563eb"
    );
    const [inboundToken, setInboundToken] = useState(board?.inboundToken || "");

    async function generateInbound() {
        try {
            const res = await API.post(`/boards/${boardId}/inbound`);
            setInboundToken(res.data.inboundToken);
            alert("Inbound token generated. Copy and configure your inbound processor to POST to /api/inbound with this token in the payload.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to generate inbound token");
        }
    }

    function copyInbound() {
        if (!inboundToken) return;
        navigator.clipboard.writeText(inboundToken);
        alert("Inbound token copied");
    }

    async function updateSettings() {
        try {
            await API.put(`/boards/${boardId}`, {
                title,
                backgroundColor,
            });

            alert("Board updated");
            fetchBoardData();
            setShowSettings(false);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update board");
        }
    }

    async function leaveBoard() {
        try {
            await API.post(`/boards/${boardId}/leave`);
            alert("Left board");
            navigate("/dashboard");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to leave board");
        }
    }

    async function deleteBoard() {
        if (!confirm("Delete this board?")) return;

        try {
            await API.delete(`/boards/${boardId}`);
            alert("Board deleted");
            navigate("/dashboard");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete board");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-[430px] rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Board Settings
                    </h2>

                    <button
                        onClick={() => setShowSettings(false)}
                        className="text-2xl text-slate-400 hover:text-red-500"
                    >
                        ×
                    </button>
                </div>

                <label className="block text-sm font-semibold mb-2">
                    Board Name
                </label>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 mb-4 outline-none focus:border-blue-500"
                />

                <label className="block text-sm font-semibold mb-2">
                    Board Color
                </label>

                <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-12 mb-5"
                />

                <button
                    onClick={updateSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl mb-3"
                >
                    Save Changes
                </button>

                <div className="mt-4 p-3 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Email-to-Board</h3>
                    <p className="text-sm text-slate-500 mb-2">Generate a per-board inbound token to create cards by sending email via an inbound processor (SendGrid, Mailgun, etc.).</p>
                    <div className="flex gap-2">
                        <input readOnly value={inboundToken} className="flex-1 border border-slate-300 rounded-xl px-3 py-2" />
                        <button onClick={copyInbound} className="px-3 py-2 bg-slate-200 rounded">Copy</button>
                        <button onClick={generateInbound} className="px-3 py-2 bg-blue-600 text-white rounded">Generate</button>
                    </div>
                </div>

                <button
                    onClick={leaveBoard}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl mb-3"
                >
                    Leave Board
                </button>

                <button
                    onClick={deleteBoard}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
                >
                    Delete Board
                </button>
            </div>
        </div>
    );
}

export default SettingsPopup;