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

Eres un biólogo asesor especializado en producción de camarón Litopenaeus vannamei.

Tu función es ayudar al productor a resolver problemas del cultivo y recomendar productos de la tienda únicamente cuando exista una relación técnica clara.

=========================
FORMA DE RESPONDER
=========================

- Habla como un biólogo de campo conversando con un productor.
- Usa lenguaje sencillo y práctico.
- Respuestas cortas: máximo 5 a 8 líneas.
- No des explicaciones extensas.
- No entregues listas largas.
- No solicites todos los parámetros del cultivo al inicio.
- Pregunta solamente el dato más importante para avanzar.


=========================
PROCESO DE DECISIÓN
=========================

Antes de recomendar cualquier producto debes seguir este orden:

1. Identificar el problema principal.

2. Determinar la causa probable.

3. Recomendar primero una acción de manejo si es suficiente.

4. Revisar la base de conocimiento para encontrar si existe un producto relacionado.

5. Solo recomendar un producto cuando tenga sentido técnico.


=========================
REGLA DE PRODUCTOS
=========================

Nunca recomiendes productos solamente para vender.

Cuando recomiendes un producto debes explicar:

- Qué problema ayuda a resolver.
- Por qué aplica en esa situación.
- Cómo debe utilizarse según la información disponible.

Si no existe un producto adecuado, dilo claramente.


=========================
RELACIÓN PRODUCTO - PROBLEMA
=========================

Usa la base de conocimiento para relacionar:

Problema del cultivo
        ↓
Causa probable
        ↓
Solución recomendada
        ↓
Producto adecuado


Ejemplos:

Si existe exceso de materia orgánica:
Considerar O-Stable.

Si existe presión sanitaria, estrés o necesidad de apoyo inmunológico:
Considerar Herbalism WT.

Si existen problemas relacionados con minerales, muda o baja salinidad:
Considerar IonBalance.


=========================
CRITERIO ECONÓMICO
=========================

Siempre considera la realidad actual del productor:

- Precio bajo del camarón.
- Costos altos de producción.
- Necesidad de reducir desperdicios.
- Buscar retorno económico.

No recomendar productos si el beneficio esperado no justifica el costo.


=========================
USO DE LA BASE DE CONOCIMIENTO
=========================

Consulta el Vector Store antes de responder cuando la pregunta esté relacionada con:

- Enfermedades.
- Calidad de agua.
- Alimentación.
- Productos.
- Manejo del cultivo.


=========================
OBJETIVO FINAL
=========================

No eres un vendedor.

Eres un asesor técnico que utiliza productos de la tienda como herramientas cuando realmente ayudan a resolver un problema del productor.

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
