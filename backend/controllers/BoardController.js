import BoardModel from "../models/boardModel.js";
import ListModel from "../models/ListModel.js";
import { createActivity } from "./ActivityController.js";
import { getIO } from "../sockets/socket.js";
import { UserModel } from "../models/userModel.js";


// CREATE BOARD
export const createBoard = async (req, res, next) => {
  try {
    console.log("Create Board API called");

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Board title required",
      });
    }

    // create board
    const board = await BoardModel.create({
      title,
      owner: req.user.id,
      members: [req.user.id],
      isDefault: false,
    });

    console.log("Board created:", board._id);

    // activity log
    await createActivity({
      boardId: board._id,
      userId: req.user.id,
      action: "created board",
      details: `Created board ${board.title}`,
    });

    // default lists
    const defaultLists = [
      {
        title: "Today",
        boardId: board._id,
        order: 1,
      },
      {
        title: "This Week",
        boardId: board._id,
        order: 2,
      },
      {
        title: "Later",
        boardId: board._id,
        order: 3,
      },
    ];

    await ListModel.insertMany(defaultLists);

    console.log("Default lists created");

    // populate owner details
    const populatedBoard = await BoardModel.findById(board._id)
      .populate("owner", "name email");

    // send board + default lists through socket
    const boardWithLists = {
      ...populatedBoard.toObject(),
      lists: defaultLists,
    };

    const io = getIO();

    io.emit("board-created", boardWithLists);

    console.log("Socket emitted: board-created");

    // response
    res.status(201).json({
      message: "Board created successfully",
      board: boardWithLists,
    });

  } catch (err) {
    next(err);
  }
};



// GET ALL BOARDS
export const getBoards = async (req, res, next) => {
  try {
    console.log("Get Boards API called");

    const boards = await BoardModel.find({
      members: req.user.id,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(boards);

  } catch (err) {
    next(err);
  }
};



// GET SINGLE BOARD
export const getSingleBoard = async (req, res, next) => {
  try {
    console.log("Get Single Board API called");

    const { id } = req.params;

    const board = await BoardModel.findById(id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    res.json(board);

  } catch (err) {
    next(err);
  }
};



// DELETE BOARD
export const deleteBoard = async (req, res, next) => {
  try {
    console.log("Delete Board API called");

    const { id } = req.params;

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    // only owner can delete
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // activity log
    await createActivity({
      boardId: board._id,
      userId: req.user.id,
      action: "deleted board",
      details: `Deleted board ${board.title}`,
    });

    // delete board
    await BoardModel.findByIdAndDelete(id);

    // delete board lists
    await ListModel.deleteMany({
      boardId: id,
    });

    // socket emit
    const io = getIO();

    io.emit("board-deleted", id);

    console.log("Socket emitted: board-deleted");

    res.json({
      message: "Board deleted successfully",
    });

  } catch (err) {
    next(err);
  }
};


//membership 

//get board members
export const getBoardMembers = async (req, res, next) => {
  try {
    const board = await BoardModel.findById(req.params.id)
      .populate("members", "name email");

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.json(board.members);
  } catch (err) {
    next(err);
  }
};


//add board memberx
export const inviteBoardMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // only board owner/admin can invite
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only board admin can invite members",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (board.members.some((m) => m.toString() === user._id.toString())) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    if (board.pendingMembers.some((m) => m.toString() === user._id.toString())) {
      return res.status(400).json({
        message: "Invite already sent",
      });
    }

    board.pendingMembers.push(user._id);
    await board.save();

    res.json({
      message: "Invite sent successfully",
    });
  } catch (err) {
    next(err);
  }
};

//remove board member
export const removeBoardMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only board admin can remove members",
      });
    }

    if (userId === board.owner.toString()) {
      return res.status(400).json({
        message: "Board admin cannot be removed",
      });
    }

    board.members = board.members.filter(
      (m) => m.toString() !== userId
    );

    await board.save();

    res.json({
      message: "Member removed successfully",
    });
  } catch (err) {
    next(err);
  }
};

//accept invite controller


export const getMyBoardInvites = async (
  req,
  res,
  next
) => {
  try {
    const boards = await BoardModel.find({
      pendingMembers: req.user.id,
    }).populate("owner", "name email");

    res.json(boards);
  } catch (err) {
    next(err);
  }
};



export const acceptBoardInvite = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    const isInvited =
      board.pendingMembers.some(
        (m) =>
          m.toString() === req.user.id
      );

    if (!isInvited) {
      return res.status(403).json({
        message:
          "No invite found for this board",
      });
    }

    board.pendingMembers =
      board.pendingMembers.filter(
        (m) =>
          m.toString() !== req.user.id
      );

    board.members.push(req.user.id);

    await board.save();

    res.json({
      message:
        "Joined board successfully",
    });
  } catch (err) {
    next(err);
  }
};


export const updateBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, backgroundColor } = req.body;

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only board owner can update settings",
      });
    }

    if (title) board.title = title;
    if (backgroundColor) board.backgroundColor = backgroundColor;

    await board.save();

    res.json({
      message: "Board updated successfully",
      board,
    });
  } catch (err) {
    next(err);
  }
};

export const leaveBoard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const board = await BoardModel.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.owner.toString() === req.user.id) {
      return res.status(400).json({
        message: "Owner cannot leave board. Delete board instead.",
      });
    }

    board.members = board.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );

    await board.save();

    res.json({ message: "Left board successfully" });
  } catch (err) {
    next(err);
  }
};

// GENERATE INBOUND TOKEN (owner only)
export const generateInboundToken = async (req, res, next) => {
  try {
    const { id } = req.params;

    const board = await BoardModel.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can generate inbound token" });
    }

    // generate simple token
    const token = Math.random().toString(36).slice(2, 12);
    board.inboundToken = token;
    await board.save();

    res.json({ message: "Inbound token generated", inboundToken: token });
  } catch (err) {
    next(err);
  }
};