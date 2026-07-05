require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CHAT
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Mensaje vacío" });
        }

        // 1. Crear thread
        const thread = await openai.beta.threads.create();

        // 2. Mensaje usuario
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message,
        });

        // 3. RUN AUTOMÁTICO (SIN WHILE)
        const run = await openai.beta.threads.runs.createAndPoll(
            thread.id,
            {
                assistant_id: ASSISTANT_ID,
            }
        );

        // 4. Si falla el run
        if (run.status !== "completed") {
            return res.status(500).json({
                error: "El assistant no pudo completar la respuesta",
                status: run.status
            });
        }

        // 5. Obtener mensajes
        const messages = await openai.beta.threads.messages.list(thread.id);

        const assistantMessage = messages.data.find(
            m => m.role === "assistant"
        );

        let reply =
            assistantMessage?.content?.[0]?.text?.value ||
            "No se recibió respuesta del assistant";

        res.json({ reply });

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message || "Error en servidor"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});