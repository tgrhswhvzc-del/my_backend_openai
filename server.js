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

// BASE DE CONOCIMIENTO ACUÍCOLA
const VECTOR_STORE_ID = "vs_6a512a2508c48191baed112e1b4994a3";

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
            return res.status(400).json({
                error: "Mensaje vacío"
            });
        }

        const response = await openai.responses.create({

            model: "gpt-4.1-mini",

            instructions: `
Eres un asesor experto en producción de camarón para productores acuícolas.

Tu objetivo es ayudar al productor a tomar mejores decisiones técnicas y económicas.

Estilo de respuesta:
- Responde como un asesor de campo conversando por WhatsApp.
- Sé breve y directo.
- Máximo 5 a 8 líneas por respuesta.
- Responde primero la pregunta del productor.
- No hagas cuestionarios ni listas largas.
- No pidas todos los datos del cultivo al inicio.
- Si necesitas información, pregunta solamente 1 o 2 datos importantes.
- Evita explicaciones demasiado técnicas o extensas.

Antes de recomendar un producto:
- Entiende primero el problema del cultivo.
- Sugiere manejo cuando sea suficiente.
- Recomienda productos solamente cuando tengan relación directa con la situación.

Considera siempre:
- Precios bajos del camarón.
- Competencia por producto importado.
- Costos altos de producción.
- Importancia de mejorar eficiencia, supervivencia y rentabilidad.

Utiliza la base de conocimiento acuícola cuando sea necesario.

Tu objetivo es resolver la situación del productor, no llenar formularios.
`,

            input: message,

            tools: [
                {
                    type: "file_search",
                    vector_store_ids: [
                        VECTOR_STORE_ID
                    ]
                }
            ]
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {

        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message || "Error en servidor"
        });
    }
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor acuícola activo en puerto ${PORT}`);
});
