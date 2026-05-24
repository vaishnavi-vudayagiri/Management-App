import CardItem from "./CardItem";

function ListColumn({
  list,
  handleDrop,
  handleDragStart,
  changeStatus,
  deleteCard,
  deleteList,
  updateInput,
  addCard,
  getCardColor,
  getCircleStyle,
}) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(list._id)}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-h-[320px]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-800 break-words whitespace-normal">
            {list.title}
          </h2>

          <p className="text-xs text-slate-500">
            {list.cards.length} cards
          </p>
        </div>

        <button
          onClick={() => deleteList(list._id)}
          className="text-slate-400 hover:text-red-500 shrink-0"
        >
          ×
        </button>
      </div>

      <div className="space-y-4 min-h-[80px]">
        {list.cards.map((card) => (
          <CardItem
            key={card._id}
            card={card}
            listId={list._id}
            handleDragStart={handleDragStart}
            changeStatus={changeStatus}
            deleteCard={deleteCard}
            getCardColor={getCardColor}
            getCircleStyle={getCircleStyle}
          />
        ))}
      </div>

      <div className="mt-5 border border-dashed border-blue-200 rounded-2xl p-3">
        <input
          type="text"
          placeholder="Card title"
          value={list.inputTitle}
          onChange={(e) =>
            updateInput(list._id, "inputTitle", e.target.value)
          }
          className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-2 outline-none focus:border-blue-500"
        />

        <textarea
          placeholder="Description"
          value={list.inputDesc}
          onChange={(e) =>
            updateInput(list._id, "inputDesc", e.target.value)
          }
          rows="2"
          className="w-full border border-slate-300 rounded-xl px-3 py-2 mb-2 outline-none focus:border-blue-500 resize-none"
        />

        <button
          onClick={() => addCard(list._id)}
          className="w-full text-blue-600 border border-blue-200 py-2 rounded-xl font-semibold hover:bg-blue-50"
        >
          + Add Card
        </button>
      </div>
    </div>
  );
}

export default ListColumn;