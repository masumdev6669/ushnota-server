import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";

const router = Router();

router.get("/", async (_req, res) => {
  const events = await getDB()
    .collection("events")
    .find({ eventDate: { $gt: new Date() } })
    .sort({ eventDate: 1 })
    .toArray();
  res.json(events);
});

router.get("/recent", async (_req, res) => {
  const events = await getDB()
    .collection("events")
    .find({ eventDate: { $gt: new Date() } })
    .sort({ eventDate: 1 })
    .limit(6)
    .toArray();
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }
  const event = await getDB()
    .collection("events")
    .findOne({ _id: new ObjectId(id) });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
});

export default router;
