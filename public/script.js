console.log("Chat iniciado");

const chat = document.getElementById("chat");

const message = document.getElementById("message");

const sendButton = document.getElementById("sendButton");

async function sendMessage(){

    const userMessage = message.value.trim();

    if(userMessage==="") return;

    chat.innerHTML += `

        <div class="user-message">

            ${userMessage}

        </div>

    `;

    chat.scrollTop=chat.scrollHeight;

    message.value="";

    const typing=document.createElement("div");

    typing.className="bot-message";

    typing.id="typing";

    typing.innerHTML="🤖 Escribiendo...";

    chat.appendChild(typing);

    chat.scrollTop=chat.scrollHeight;

    try{

        const response=await fetch("/chat",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:userMessage

            })

        });

        const data=await response.json();

        document.getElementById("typing").remove();

        chat.innerHTML +=`

            <div class="bot-message">

                ${data.reply}

            </div>

        `;

        chat.scrollTop=chat.scrollHeight;

    }

    catch(error){

        document.getElementById("typing").remove();

        chat.innerHTML +=`

            <div class="bot-message">

                ❌ Error al conectar con el servidor.

            </div>

        `;

    }

}

sendButton.addEventListener("click",sendMessage);

message.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});