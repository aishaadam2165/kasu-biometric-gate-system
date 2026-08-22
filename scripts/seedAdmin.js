require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas.");

  const AdminSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true, lowercase: true, trim: true },
      password: { type: String, select: false },
      role: { type: String, default: "admin" },
      lastLoginAt: { type: Date, default: null },
    },
    { timestamps: true }
  );

  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists for ${ADMIN_EMAIL}. Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await Admin.create({
    name: ADMIN_NAME || "System Administrator",
    email: ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
  });

  console.log(`Admin account created for ${ADMIN_EMAIL}.`);
  console.log("You can now log in from the /login page with these credentials.");

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
