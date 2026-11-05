import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.post("/", verifyToken, async (req, res) => {
  const eventId = String(req.body?.eventId ?? "");
  if (!ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }
  const db = getDB();
  const event = await db
    .collection("events")
    .findOne({ _id: new ObjectId(eventId) });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  if (new Date(event.eventDate).getTime() <= Date.now()) {
    res.status(400).json({ message: "This event has already taken place" });
    return;
  }
  try {
    await db.collection("joins").insertOne({
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.eventDate,
      userEmail: req.user!.email,
      userName: req.user!.name,
      joinedAt: new Date(),
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ message: "You have already joined this event" });
      return;
    }
    throw err;
  }
  res.status(201).json({ message: "Joined event" });
});

router.get("/mine", verifyToken, async (req, res) => {
  const db = getDB();
  const joins = await db
    .collection("joins")
    .find({ userEmail: req.user!.email })
    .toArray();
  const ids = joins.map((j) => j.eventId);
  const events = await db
    .collection("events")
    .find({ _id: { $in: ids } })
    .sort({ eventDate: 1 })
    .toArray();
  res.json(events);
});

router.get("/status/:eventId", verifyToken, async (req, res) => {
  const eventId = String(req.params.eventId);
  if (!ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }
  const found = await getDB()
    .collection("joins")
    .findOne({ eventId: new ObjectId(eventId), userEmail: req.user!.email });
  res.json({ joined: Boolean(found) });
});

export default router;
