function ActivityPopup({ activities, setShowActivities }) {
  return (
    <div className="absolute right-6 top-20 bg-white w-96 rounded-2xl shadow-xl border border-slate-200 z-50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          Activity Logs
        </h2>

        <button
          onClick={() => setShowActivities(false)}
          className="text-slate-400 hover:text-red-500 text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 && (
          <p className="text-slate-500 text-sm">
            No activities yet
          </p>
        )}

        {activities.map((activity) => (
          <div
            key={activity._id}
            className="border border-slate-200 rounded-xl p-3"
          >
            <p className="font-semibold text-slate-800">
              {activity.details}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              By {activity.userId?.name || "Unknown user"}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityPopup;