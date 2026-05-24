import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../api/api";

import MembersPopup from "../components/board/MembersPopup";

import Sidebar from "../components/board/Sidebar";
import BoardNavbar from "../components/board/BoardNavbar";
import ActivityPopup from "../components/board/ActivityPopup";
import SettingsPopup from "../components/board/SettingsPopup";
import ListColumn from "../components/board/ListColumn";

function BoardPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // boardId
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [activities, setActivities] = useState([]);

  const [draggedCard, setDraggedCard] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalDesc, setGlobalDesc] = useState("");
  const [showActivities, setShowActivities] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ================= FETCH BOARD DATA =================
  async function fetchBoardData() {
    try {
      const boardRes = await API.get(`/boards/${id}`);
      const listsRes = await API.get(`/lists/${id}`);
      const cardsRes = await API.get(`/cards/board/${id}`);

      setBoard(boardRes.data);
      setCards(cardsRes.data);

      const mergedLists = listsRes.data.map((list) => ({
        ...list,
        id: list._id,
        cards: cardsRes.data.filter((card) => card.listId === list._id),
        inputTitle: "",
        inputDesc: "",
      }));

      setLists(mergedLists);

      try {
        const activityRes = await API.get(`/activity/${id}`);
        setActivities(activityRes.data);
      } catch {
        setActivities([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load board");
    }
  }

  useEffect(() => {
    fetchBoardData();
  }, [id]);

  // ================= ADD LIST =================
  async function addList() {
    if (!newListName.trim()) return;

    try {
      await API.post("/lists", {
        title: newListName,
        boardId: id,
      });

      setNewListName("");
      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create list");
    }
  }

  // ================= INPUT UPDATE =================
  function updateInput(listId, field, value) {
    setLists((prev) =>
      prev.map((list) =>
        list._id === listId || list.id === listId
          ? { ...list, [field]: value }
          : list
      )
    );
  }

  // ================= ADD CARD TO LIST =================
  async function addCard(listId) {
    const list = lists.find((l) => l._id === listId || l.id === listId);

    if (!list?.inputTitle?.trim()) return;

    try {
      await API.post("/cards", {
        title: list.inputTitle,
        description: list.inputDesc,
        listId,
        boardId: id,
        status: "ongoing",
      });

      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create card");
    }
  }

  async function addGlobalCard() {
    if (!globalTitle.trim()) return;

    try {
      await API.post("/cards", {
        title: globalTitle,
        description: globalDesc,
        boardId: id,
        listId: null,
        status: "ongoing",
      });

      setGlobalTitle("");
      setGlobalDesc("");
      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create card");
    }
  }

  // ================= DELETE CARD =================
  async function deleteCard(listId, cardId) {
    try {
      await API.delete(`/cards/${cardId}`);
      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete card");
    }
  }

  // ================= DELETE GLOBAL CARD =================
  async function deleteGlobalCard(cardId) {
    try {
      await API.delete(`/cards/${cardId}`);
      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete card");
    }
  }

  // ================= DELETE LIST =================
  async function deleteList(listId) {
    const list = lists.find((l) => l._id === listId || l.id === listId);

    if (["Today", "This Week", "Later"].includes(list?.title)) {
      alert("Default lists cannot be deleted");
      return;
    }

    try {
      await API.delete(`/lists/${listId}`);
      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete list");
    }
  }

  // ================= CHANGE CARD STATUS =================
  async function changeStatus(listId, cardId) {
    const card = cards.find((c) => c._id === cardId || c.id === cardId);

    if (!card) return;

    const nextStatus =
      card.status === "ongoing"
        ? "doing"
        : card.status === "doing"
          ? "done"
          : "ongoing";

    try {
      await API.put(`/cards/${cardId}`, {
        status: nextStatus,
      });

      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  }

  // ================= DRAG START =================
  function handleDragStart(listId, card, fromGlobal = false) {
    setDraggedCard({ listId, card, fromGlobal });
  }

  // ================= DROP CARD =================
  async function handleDrop(targetListId) {
    if (!draggedCard) return;

    try {
      await API.put(`/cards/move/${draggedCard.card._id}`, {
        newListId: targetListId,
        newOrder: Date.now(),
      });

      setDraggedCard(null);
      fetchBoardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move card");
    }
  }

  // ================= COLORS =================
  function getCardColor(status) {
    if (status === "ongoing") return "bg-red-50 border-red-200";
    if (status === "doing") return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  }

  function getCircleStyle(status) {
    if (status === "ongoing") return "border-red-400 bg-white";
    if (status === "doing") return "border-yellow-500 border-dashed bg-white";
    return "border-green-500 bg-green-500";
  }

  const totalCards = cards.length;

  const globalCards = cards.filter(
    (card) => !card.listId
  );

  const filteredLists = lists
    .map((list) => {
      const search = searchText.toLowerCase();

      if (!searchText.trim()) return list;

      const listMatches = list.title.toLowerCase().includes(search);

      const filteredCards = list.cards.filter(
        (card) =>
          card.title.toLowerCase().includes(search) ||
          card.description?.toLowerCase().includes(search)
      );

      if (listMatches || filteredCards.length > 0) {
        return {
          ...list,
          cards: listMatches ? list.cards : filteredCards,
        };
      }

      return null;
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        newListName={newListName}
        setNewListName={setNewListName}
        addList={addList}
        globalTitle={globalTitle}
        setGlobalTitle={setGlobalTitle}
        globalDesc={globalDesc}
        setGlobalDesc={setGlobalDesc}
        addGlobalCard={addGlobalCard}
        globalCards={globalCards}
        deleteGlobalCard={deleteGlobalCard}
        handleDragStart={handleDragStart}
        setShowMembers={setShowMembers}
        setShowSettings={setShowSettings}
      />

      {showMembers && (
        <MembersPopup
          boardId={id}
          setShowMembers={setShowMembers}
        />
      )}

      {showSettings && (
        <SettingsPopup
          board={board}
          boardId={id}
          setShowSettings={setShowSettings}
          fetchBoardData={fetchBoardData}
        />
      )}

      <main
        className="flex-1 min-w-0 relative"
        style={{
          backgroundColor: board?.backgroundColor || "#f8fafc",
        }}
      >
        <BoardNavbar
          searchText={searchText}
          setSearchText={setSearchText}
          activities={activities}
          showActivities={showActivities}
          setShowActivities={setShowActivities}
          navigate={navigate}
        />

        {showActivities && (
          <ActivityPopup
            activities={activities}
            setShowActivities={setShowActivities}
          />
        )}

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800">
              {board?.title || "Workspace Board"}
            </h2>

            <p className="text-slate-500 mt-1">
              {lists.length} lists · {totalCards} cards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {filteredLists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                handleDrop={handleDrop}
                handleDragStart={handleDragStart}
                changeStatus={changeStatus}
                deleteCard={deleteCard}
                deleteList={deleteList}
                updateInput={updateInput}
                addCard={addCard}
                getCardColor={getCardColor}
                getCircleStyle={getCircleStyle}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BoardPage;