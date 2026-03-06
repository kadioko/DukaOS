const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

async function register(req, res) {
  const { phone, pin, name, role = "MERCHANT", shopName, shopLocation, shopCategory, shopDistrict } = req.body;

  if (!phone || !pin || !name) {
    return res.status(400).json({ error: "Phone, PIN, and name are required" });
  }
  if (pin.length < 4) {
    return res.status(400).json({ error: "PIN must be at least 4 digits" });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return res.status(409).json({ error: "Phone number already registered" });
  }

  const hashedPin = await bcrypt.hash(pin, 10);

  const user = await prisma.user.create({
    data: {
      phone,
      pin: hashedPin,
      name,
      role: role.toUpperCase(),
    },
  });

  if (role.toUpperCase() === "MERCHANT") {
    await prisma.shop.create({
      data: {
        name: shopName || `${name}'s Duka`,
        location: shopLocation || "Dar es Salaam",
        district: shopDistrict,
        category: shopCategory || "general",
        userId: user.id,
      },
    });
  }

  if (role.toUpperCase() === "SUPPLIER") {
    await prisma.supplier.create({
      data: {
        name: name,
        phone: phone,
        userId: user.id,
      },
    });
  }

  const token = issueToken(user);
  const profile = await getProfile(user.id);
  res.status(201).json({ token, user: profile });
}

async function login(req, res) {
  const { phone, pin } = req.body;
  if (!phone || !pin) {
    return res.status(400).json({ error: "Phone and PIN required" });
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return res.status(401).json({ error: "Invalid phone or PIN" });
  }

  const match = await bcrypt.compare(pin, user.pin);
  if (!match) {
    return res.status(401).json({ error: "Invalid phone or PIN" });
  }

  const token = issueToken(user);
  const profile = await getProfile(user.id);
  res.json({ token, user: profile });
}

async function me(req, res) {
  const profile = await getProfile(req.user.userId);
  if (!profile) return res.status(404).json({ error: "User not found" });
  res.json({ user: profile });
}

async function updateLanguage(req, res) {
  const { language } = req.body;
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { language },
  });
  res.json({ message: "Language updated" });
}

function issueToken(user) {
  return jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

async function getProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      language: true,
      shop: { select: { id: true, name: true, location: true, district: true, category: true } },
      supplier: { select: { id: true, name: true, phone: true, address: true } },
      createdAt: true,
    },
  });
}

module.exports = { register, login, me, updateLanguage };
