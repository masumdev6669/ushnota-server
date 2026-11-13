import { Router } from "express";
import { SignJWT } from "jose";

const router = Router();

router.post("/token", async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ message: "email is required" });
    return;
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  res.json({ token });
});

export default router;
