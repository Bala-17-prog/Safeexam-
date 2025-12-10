const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// IMPORT ROUTES
const authRoute = require("./routes/auth");
const questionRoute = require("./routes/questions");
const resultRoute = require("./routes/results");
const userRoute = require("./routes/users");

dotenv.config();
const app = express();

// ALLOWED FRONTEND ORIGINS
const allowedOrigins = [
  "http://localhost:5173",
  "https://safeexam-1-05vl.onrender.com"  // ✅ Your deployed frontend
];

// CORS SETTINGS
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// MONGODB CONNECTION
const MONGO_URI = "mongodb+srv://synnoviqtechofficepc_db_user:ASRPAYALUGA@cluster0.el0csg7.mongodb.net/safe-exam-db?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Cloud)"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ROUTES
app.use("/api/auth", authRoute);
app.use("/api/questions", questionRoute);
app.use("/api/results", resultRoute);
app.use("/api/users", userRoute);

// PORT FOR RENDER
const PORT = process.env.PORT || 4000; // ✅ Use Render port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
