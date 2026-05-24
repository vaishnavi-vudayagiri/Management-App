import ListModel from "../models/listModel.js";
import BoardModel from "../models/boardModel.js";
import { createActivity } from "./ActivityController.js";
import { getIO } from "../sockets/socket.js";


// CREATE LIST
export const createList = async (req, res, next) => {
  try {
    console.log("Create List API called");

    const { title, boardId } = req.body;

    // validation
    if (!title || !boardId) {
      return res.status(400).json({
        message: "Title and boardId required",
      });
    }

    // check board exists
    const board = await BoardModel.findById(boardId);

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    // create list
    const list = await ListModel.create({
      title,
      boardId,
      order: Date.now(),
    });

    console.log("List created:", list._id);

    // activity log
    await createActivity({
      boardId,
      listId: list._id,
      userId: req.user.id,
      action: "created list",
      details: `Created list ${title}`,
    });

    // socket emit
    const io = getIO();

    io.to(boardId.toString()).emit(
      "list-created",
      list
    );

    console.log("Socket emitted: list-created");

    res.status(201).json({
      message: "List created successfully",
      list,
    });

  } catch (err) {
    next(err);
  }
};



// GET BOARD LISTS
export const getBoardLists = async (req, res, next) => {
  try {
    console.log("Get Board Lists API called");

    const { boardId } = req.params;

    const lists = await ListModel.find({
      boardId,
    }).sort({ order: 1 });

    res.json(lists);

  } catch (err) {
    next(err);
  }
};



// UPDATE LIST
export const updateList = async (req, res, next) => {
  try {
    console.log("Update List API called");

    const { id } = req.params;
    const { title } = req.body;

    const list = await ListModel.findByIdAndUpdate(
      id,
      { title },
     {
  returnDocument: "after"
}
    );

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    // activity log
    await createActivity({
      boardId: list.boardId,
      listId: list._id,
      userId: req.user.id,
      action: "updated list",
      details: `Updated list to ${title}`,
    });

    // socket emit
    const io = getIO();

    io.to(list.boardId.toString()).emit(
      "list-updated",
      list
    );

    console.log("Socket emitted: list-updated");

    res.json({
      message: "List updated successfully",
      list,
    });

  } catch (err) {
    next(err);
  }
};



// DELETE LIST
export const deleteList = async (req, res, next) => {
  try {
    console.log("Delete List API called");

    const { id } = req.params;

    const list = await ListModel.findById(id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    // activity log
    await createActivity({
      boardId: list.boardId,
      listId: list._id,
      userId: req.user.id,
      action: "deleted list",
      details: `Deleted list ${list.title}`,
    });

    // delete list
    await ListModel.findByIdAndDelete(id);

    // socket emit
    const io = getIO();

    io.to(list.boardId.toString()).emit(
      "list-deleted",
      id
    );

    console.log("Socket emitted: list-deleted");

    res.json({
      message: "List deleted successfully",
    });

  } catch (err) {
    next(err);
  }
};



// REORDER LISTS
export const reorderLists = async (req, res, next) => {
  try {
    console.log("Reorder Lists API called");

    const { lists } = req.body;

    // validation
    if (!lists || lists.length === 0) {
      return res.status(400).json({
        message: "Lists array required",
      });
    }

    // update order
    for (const item of lists) {
      await ListModel.findByIdAndUpdate(
        item.id,
        {
          order: item.order,
        }
      );
    }

    // get board id
    const firstList = await ListModel.findById(
      lists[0].id
    );

    // socket emit
    const io = getIO();

    io.to(firstList.boardId.toString()).emit(
      "lists-reordered",
      lists
    );

    console.log("Socket emitted: lists-reordered");

    res.json({
      message: "Lists reordered successfully",
    });

  } catch (err) {
    next(err);
  }
};