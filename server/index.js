const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});

app.use(cors());
app.use(express.json());

// In-memory data
let nextId = 1;
let queue = []; // { id, name, status, createdAt }

// Socket connection
io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Helper
function getQueueState() {
    const current = queue.find((p) => p.status === "serving") || null;
    const waiting = queue.filter((p) => p.status === "waiting");
    const done = queue.filter((p) => p.status === "done");

    return { current, waiting, done };
}

// Health check
app.get("/", (req, res) => {
    res.send("Clinic Queue API is running");
});

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "server is running" });
});

// Get queue
app.get("/queue", (req, res) => {
    res.json(getQueueState());
});

// Add patient
app.post("/queue", (req, res) => {
    const name = (req.body?.name || "").trim();

    if (!name) {
        return res.status(400).json({ ok: false, error: "Name is required" });
    }

    const hasCurrent = queue.some((p) => p.status === "serving");

    const patient = {
        id: nextId++,
        name,
        status: hasCurrent ? "waiting" : "serving",
        createdAt: new Date().toISOString(),
    };

    queue.push(patient);

    const state = getQueueState();
    io.emit("queueUpdated", state);

    res.status(201).json({
        ok: true,
        message: "Patient added",
        patient,
        state,
    });
});

// Move to next patient
app.post("/queue/next", (req, res) => {
    const currentIndex = queue.findIndex((p) => p.status === "serving");

    if (currentIndex !== -1) {
        queue[currentIndex].status = "done";
    }

    const nextPatient = queue.find((p) => p.status === "waiting");

    if (nextPatient) {
        nextPatient.status = "serving";
    }

    const state = getQueueState();
    io.emit("queueUpdated", state);

    res.json({
        ok: true,
        message: "Moved to next patient",
        state,
    });
});

// Reset queue
app.delete("/queue", (req, res) => {
    queue = [];
    nextId = 1;

    const state = getQueueState();
    io.emit("queueUpdated", state);

    res.json({
        ok: true,
        message: "Queue cleared",
        state,
    });
});
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`API + Socket running on port ${PORT}`);
});