function Sidebar({
  newListName,
  setNewListName,
  addList,

  globalTitle,
  setGlobalTitle,
  globalDesc,
  setGlobalDesc,
  addGlobalCard,
  globalCards,
  deleteGlobalCard,
  handleDragStart,

  setShowMembers,
  setShowSettings,
}) {
  return (
    <aside className="w-[330px] bg-white border-r border-slate-200 min-h-screen hidden lg:flex flex-col sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">TaskFlow</h1>
        <p className="text-sm text-slate-500 mt-1">Team Workspace</p>
      </div>

      <nav className="px-4 space-y-2">
        <button className="w-full text-left bg-blue-50 text-blue-600 font-semibold px-4 py-3 rounded-xl">
          Boards
        </button>

        <button
          onClick={() => setShowMembers(true)}
          className="w-full text-left text-slate-600 px-4 py-3 rounded-xl hover:bg-slate-100"
        >
          Members
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="w-full text-left text-slate-600 px-4 py-3 rounded-xl hover:bg-slate-100"
        >
          Settings
        </button>
      </nav>

      <div className="px-4 mt-6 pb-6 overflow-y-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Add New List</h2>

          <input
            type="text"
            placeholder="List name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={addList}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold"
          >
            + Add List
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm mt-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800">Unassigned Cards</h2>

            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
              {globalCards.length}
            </span>
          </div>

          <input
            type="text"
            placeholder="Card title"
            value={globalTitle}
            onChange={(e) => setGlobalTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-2 outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Description"
            value={globalDesc}
            onChange={(e) => setGlobalDesc(e.target.value)}
            rows="2"
            className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-3 outline-none focus:border-blue-500 resize-none"
          />

          <button
            onClick={addGlobalCard}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-semibold"
          >
            + Create Card
          </button>

          <div className="space-y-3 mt-4">
            {globalCards.map((card) => (
              <div
                key={card._id}
                draggable
                onDragStart={() => handleDragStart(null, card, true)}
                className="bg-purple-50 border border-purple-200 rounded-xl p-3 cursor-grab relative"
              >
                <button
                  onClick={() => deleteGlobalCard(card._id)}
                  className="absolute top-2 right-3 text-slate-400 hover:text-red-500"
                >
                  ×
                </button>

                <h4 className="font-bold text-slate-800 break-words pr-5">
                  {card.title}
                </h4>

                {card.description && (
                  <p className="text-sm text-slate-500 mt-1 break-words">
                    {card.description}
                  </p>
                )}

                <div className="mt-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      card.status === "done"
                        ? "bg-green-100 text-green-700"
                        : card.status === "doing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;