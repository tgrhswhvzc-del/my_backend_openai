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


// BASE DE CONOCIMIENTO ACUICOLA
const VECTOR_STORE_ID = "vs_6a512a2508c48191baed112e1b4994a3";


// MEMORIA TEMPORAL
// Después puedes cambiar esto por MongoDB, Supabase o PostgreSQL
const conversations = {};



app.use(cors());

app.use(express.json({
    limit:"1mb"
}));


app.use(express.static(
    path.join(__dirname,"public")
));



app.get("/",(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});





app.post("/chat", async(req,res)=>{


try{


const {
    message,
    producerId
}=req.body;



if(!message){

return res.status(400).json({

error:"Mensaje vacío"

});

}



if(message.length > 3000){

return res.status(400).json({

error:"Mensaje demasiado largo"

});

}





// Crear memoria del productor

let conversationId = null;


if(producerId){


conversationId = conversations[producerId];


if(!conversationId){


const conversation =
await openai.conversations.create();


conversationId =
conversation.id;


conversations[producerId]=conversationId;


}


}





const response =
await openai.responses.create({


model:
process.env.OPENAI_MODEL || "gpt-5-mini",



conversation:
conversationId,



instructions:`


IDENTIDAD:

Eres un Biólogo Acuacultor senior especializado en producción de camarón y acuacultura sostenible.

Tu función es asesorar productores, técnicos y empresas acuícolas.



CONTEXTO ACTUAL DEL SECTOR:

Considera siempre que el productor enfrenta:

- precios internacionales del camarón deprimidos.
- competencia de camarón importado.
- costos elevados de alimento, energía y operación.
- necesidad de producir más kilos con menor costo.
- importancia del retorno económico de cada decisión.



FORMA DE ANALIZAR:

Antes de recomendar:

Evalúa:

1. Impacto productivo.
2. Impacto económico.
3. Facilidad de aplicación.
4. Riesgo para el cultivo.



ESTILO:

- Habla como un asesor real de campo.
- Sé profesional pero sencillo.
- No des respuestas genéricas.
- No hagas listas largas.
- Normalmente responde entre 100 y 250 palabras.
- Prioriza soluciones prácticas.



METODO:

Primero:

1. Explica qué puede estar ocurriendo.
2. Da la acción inmediata.
3. Explica cómo comprobar si funcionó.



DIAGNOSTICO:

No pidas 20 parámetros al inicio.

Pregunta solamente los datos más importantes:

- días de cultivo.
- peso promedio.
- consumo de alimento.
- oxígeno.
- temperatura.
- mortalidad.
- cambios recientes.



PRODUCTOS:

Si el usuario pregunta por productos:

No vendas directamente.

Primero identifica:

- problema productivo.
- causa probable.
- beneficio esperado.

Después recomienda solamente si tiene sentido.



BASE TECNICA:

Utiliza siempre el conocimiento del Vector Store cuando sea relevante.

Prioriza documentos técnicos internos.

No inventes información.

Si no existe información suficiente dilo claramente.



OBJETIVO FINAL:

Ayudar al productor a tomar mejores decisiones productivas y económicas.

No solamente resolver problemas técnicos,
sino mejorar rentabilidad del cultivo.



`,



tools:[

{

type:"file_search",

vector_store_ids:[

VECTOR_STORE_ID

]

}

],



input:message



});





res.json({


reply:

response.output_text ||

"No se obtuvo respuesta",


conversationId


});





}catch(error){


console.error(error);


res.status(500).json({

error:error.message

});


}



});






app.listen(PORT,()=>{


console.log(
`Servidor acuícola activo en puerto ${PORT}`
);


});
