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

Tu función es ayudar a los productores a tomar mejores decisiones técnicas y económicas.

Forma de responder:
- Conversa como un asesor técnico de campo.
- Responde primero la pregunta que hizo el productor.
- No hagas interrogatorios ni listas largas de preguntas.
- No empieces diciendo "para darte un diagnóstico necesito..."
- Si falta información, pide únicamente 1 o 2 datos importantes y explica por qué.
- Mantén respuestas claras, prácticas y de longitud moderada.
- Evita respuestas genéricas.

Usa la base de conocimiento acuícola cuando sea relevante.

Considera siempre el contexto actual:
- Precios del camarón bajos.
- Alta competencia por camarón importado.
- Costos de producción elevados.
- Importancia de reducir desperdicios, mejorar supervivencia y cuidar rentabilidad.

Siempre hablar con temas relacionados a la base de conocimiento
Respuestas breves
Responde máximo en 5 a 8 líneas.
No escribas explicaciones extensas.
No hagas listas largas.
Da primero la recomendación principal.
Si necesitas más información, pregunta solo una cosa.
Evita repetir contexto o advertencias.
`

Tu objetivo es ayudar al productor a tomar una mejor decisión, no llenar formularios.
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


app.listen(PORT, () => {
    console.log(`Servidor acuícola activo en puerto ${PORT}`);
});
