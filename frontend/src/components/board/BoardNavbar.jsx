function BoardNavbar({
  searchText,
  setSearchText,
  activities,
  showActivities,
  setShowActivities,
  navigate,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <input
        type="text"
        placeholder="Search cards or lists..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="hidden md:block w-[350px] border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
      />

      <div className="flex items-center gap-3 ml-auto">
        <span className="hidden md:flex items-center gap-2 text-sm text-green-600 font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Live
        </span>

        <button
          onClick={() => setShowActivities(!showActivities)}
          className="bg-white border border-slate-300 hover:bg-slate-100 px-5 py-2 rounded-xl font-semibold text-slate-700 relative"
        >
          Activity

          {activities.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activities.length}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl"
        >
          Back
        </button>
      </div>
    </header>
  );
}

export default BoardNavbar;