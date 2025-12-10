const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// IMPORT ROUTES
const authRoute = require("./routes/auth");
const questionRoute = require("./routes/questions");
const resultRoute = require("./routes/results");
const userRoute = require("./routes/users"); // <--- MAKE SURE THIS IS HERE

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

const MONGO_URI = "mongodb+srv://synnoviqtechofficepc_db_user:ASRPAYALUGA@cluster0.el0csg7.mongodb.net/safe-exam-db?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Cloud)"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// USE ROUTES
app.use("/api/auth", authRoute);
app.use("/api/questions", questionRoute);
app.use("/api/results", resultRoute);
app.use("/api/users", userRoute); // <--- AND THIS LINE IS HERE

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
