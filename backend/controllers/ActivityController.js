import ActivityModel from "../models/ActivityModel.js";

export const createActivity = async ({
  boardId,
  listId = null,
  cardId = null,
  userId,
  action,
  details,
}) => {
  await ActivityModel.create({
    boardId,
    listId,
    cardId,
    userId,
    action,
    details,
  });
};

export const getActivities = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const activities = await ActivityModel.find({ boardId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    next(err);
  }
};