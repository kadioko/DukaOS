const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const VALID_ROLES = new Set(["MERCHANT", "SUPPLIER"]);
const VALID_LANGUAGES = new Set(["en", "sw"]);

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function normalizePhone(value) {
  return String(value || "").replace(/[\s()-]/g, "").trim();
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePhone(phone) {
  return /^\+?[1-9]\d{8,14}$/.test(phone);
}

function validatePin(pin) {
  return /^\d{4,8}$/.test(pin);
}

const register = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const pin = String(req.body.pin || "").trim();
  const name = normalizeText(req.body.name);
  const role = normalizeText(req.body.role || "MERCHANT").toUpperCase();
  const shopName = normalizeText(req.body.shopName);
  const shopLocation = normalizeText(req.body.shopLocation);
  const shopCategory = normalizeText(req.body.shopCategory);
  const shopDistrict = normalizeText(req.body.shopDistrict);

  if (!phone || !pin || !name) {
    return res.status(400).json({ error: "Phone, PIN, and name are required" });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: "Enter a valid phone number" });
  }

  if (!validatePin(pin)) {
    return res.status(400).json({ error: "PIN must be 4 to 8 digits" });
  }

  if (!VALID_ROLES.has(role)) {
    return res.status(400).json({ error: "Invalid role selected" });
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
      role,
    },
  });

  if (role === "MERCHANT") {
    await prisma.shop.create({
      data: {
        name: shopName || `${name}'s Duka`,
        location: shopLocation || "Dar es Salaam",
        district: shopDistrict || null,
        category: shopCategory || "general",
        userId: user.id,
      },
    });
  }

  if (role === "SUPPLIER") {
    await prisma.supplier.create({
      data: {
        name,
        phone,
        userId: user.id,
      },
    });
  }

  const token = issueToken(user);
  const profile = await getProfile(user.id);
  res.status(201).json({ token, user: profile });
});

const login = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const pin = String(req.body.pin || "").trim();

  if (!phone || !pin) {
    return res.status(400).json({ error: "Phone and PIN required" });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: "Enter a valid phone number" });
  }

  if (!validatePin(pin)) {
    return res.status(400).json({ error: "PIN must be 4 to 8 digits" });
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
});

const me = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.userId);
  if (!profile) return res.status(404).json({ error: "User not found" });
  res.json({ user: profile });
});

const updateLanguage = asyncHandler(async (req, res) => {
  const language = normalizeText(req.body.language).toLowerCase();

  if (!VALID_LANGUAGES.has(language)) {
    return res.status(400).json({ error: "Language must be 'en' or 'sw'" });
  }

  await prisma.user.update({
    where: { id: req.user.userId },
    data: { language },
  });
  res.json({ message: "Language updated" });
});

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
