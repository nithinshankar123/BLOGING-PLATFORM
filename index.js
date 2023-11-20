const postRoute = require("./routes/posts");
const express = require("express");
const multer = require("multer");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const commentRoute = require("./routes/comments");

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully!");

    // Start the server after the database connection is established
    const server = app.listen(process.env.PORT, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    });

    // Handle server shutdown gracefully
    process.on("SIGINT", () => {
      console.log("Received SIGINT. Closing server and database connection.");
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("Server and database connection closed.");
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error(err);
  }
};

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Image upload
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "images");
  },
  filename: (req, file, fn) => {
    fn(null, req.body.img);
  },
});
const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log(req.body);
  res.status(200).json("Image has been uploaded successfully!");
});

// Static files
app.use(express.static(path.join(__dirname, "./frontend/dist")));

// Catch-all route
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./frontend/dist/index.html"));
});

// Call the connectDB function to initiate the application
connectDB();
