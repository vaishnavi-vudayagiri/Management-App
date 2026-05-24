import { useEffect, useState } from "react";
import API from "../../api/api";

function MembersPopup({ boardId, setShowMembers }) {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");

  async function fetchMembers() {
    try {
      const res = await API.get(`/boards/${boardId}/members`);
      setMembers(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch members");
    }
  }

  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  async function inviteMember() {
    if (!email.trim()) {
      alert("Enter email");
      return;
    }

    try {
      await API.post(`/boards/${boardId}/invite`, {
        email,
      });

      alert("Invite sent successfully");
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to invite member");
    }
  }

  async function removeMember(userId) {
    try {
      await API.delete(`/boards/${boardId}/members/${userId}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[430px] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-slate-800">
            Board Members
          </h2>

          <button
            onClick={() => setShowMembers(false)}
            className="text-2xl text-slate-400 hover:text-red-500"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          <input
            type="email"
            placeholder="Enter registered user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
          />

          <button
            onClick={inviteMember}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl"
          >
            Invite
          </button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {members.map((member) => (
            <div
              key={member._id}
              className="border border-slate-200 rounded-xl p-3 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-slate-800">
                  {member.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {member.email}
                </p>
              </div>

              <button
                onClick={() => removeMember(member._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MembersPopup;