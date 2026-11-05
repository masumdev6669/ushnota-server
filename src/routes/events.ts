import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { verifyToken } from "../middleware/auth";
import { validateEvent } from "../utils/validateEvent";

const router = Router();

const upcoming = () => ({ eventDate: { $gt: new Date() } });

router.get("/", async (_req, res) => {
  const events = await getDB()
    .collection("events")
    .find(upcoming())
    .sort({ eventDate: 1 })
    .toArray();
  res.json(events);
});

router.get("/recent", async (_req, res) => {
  const events = await getDB()
    .collection("events")
    .find(upcoming())
    .sort({ eventDate: 1 })
    .limit(6)
    .toArray();
  res.json(events);
});

router.get("/mine", verifyToken, async (req, res) => {
  const events = await getDB()
    .collection("events")
    .find({ creatorEmail: req.user!.email })
    .sort({ eventDate: 1 })
    .toArray();
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }
  const db = getDB();
  const event = await db
    .collection("events")
    .findOne({ _id: new ObjectId(id) });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  const joinedCount = await db
    .collection("joins")
    .countDocuments({ eventId: event._id });
  res.json({ ...event, joinedCount });
});

router.post("/", verifyToken, async (req, res) => {
  const result = validateEvent(req.body ?? {});
  if (typeof result === "string") {
    res.status(400).json({ message: result });
    return;
  }
  const inserted = await getDB()
    .collection("events")
    .insertOne({
      ...result,
      creatorEmail: req.user!.email,
      creatorName: req.user!.name,
      createdAt: new Date(),
    });
  res.status(201).json({ _id: inserted.insertedId });
});

router.put("/:id", verifyToken, async (req, res) => {
  const id = String(req.params.id);
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }
  const events = getDB().collection("events");
  const existing = await events.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  if (existing.creatorEmail !== req.user!.email) {
    res.status(403).json({ message: "You can only update events you created" });
    return;
  }
  const result = validateEvent(req.body ?? {});
  if (typeof result === "string") {
    res.status(400).json({ message: result });
    return;
  }
  await events.updateOne(
    { _id: existing._id },
    { $set: { ...result, updatedAt: new Date() } },
  );
  res.json({ message: "Event updated" });
});

router.delete("/:id", verifyToken, async (req, res) => {
  const id = String(req.params.id);
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }
  const db = getDB();
  const existing = await db
    .collection("events")
    .findOne({ _id: new ObjectId(id) });
  if (!existing) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  if (existing.creatorEmail !== req.user!.email) {
    res.status(403).json({ message: "You can only delete events you created" });
    return;
  }
  await db.collection("events").deleteOne({ _id: existing._id });
  await db.collection("joins").deleteMany({ eventId: existing._id });
  res.json({ message: "Event deleted" });
});

export default router;
