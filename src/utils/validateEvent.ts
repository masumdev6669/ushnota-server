export const EVENT_TYPES = [
  "Winter Clothes Distribution",
  "Blanket Distribution",
  "Food Distribution",
  "Community Meal",
  "Winter Relief Camp",
];

export interface EventInput {
  title: string;
  description: string;
  eventType: string;
  thumbnail: string;
  location: string;
  eventDate: Date;
}

export function validateEvent(
  body: Record<string, unknown>,
): EventInput | string {
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const eventType = String(body.eventType ?? "").trim();
  const thumbnail = String(body.thumbnail ?? "").trim();
  const location = String(body.location ?? "").trim();
  const eventDate = new Date(String(body.eventDate ?? ""));

  if (title.length < 3 || title.length > 100)
    return "Title must be between 3 and 100 characters";
  if (description.length < 10 || description.length > 1500)
    return "Description must be between 10 and 1500 characters";
  if (!EVENT_TYPES.includes(eventType))
    return "Please choose a valid event type";
  try {
    const url = new URL(thumbnail);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new Error("bad protocol");
  } catch {
    return "Thumbnail must be a valid image URL";
  }
  if (location.length < 3 || location.length > 120)
    return "Location must be between 3 and 120 characters";
  if (Number.isNaN(eventDate.getTime())) return "Event date is not valid";
  if (eventDate.getTime() <= Date.now())
    return "Event date must be in the future";

  return { title, description, eventType, thumbnail, location, eventDate };
}
