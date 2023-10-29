const sendButton = document.getElementById("SendButton");
const sendText = document.getElementById("Message");
const messageStack = document.getElementById("MessageStack");

var socket = new WebSocket("ws://" + location.host + "/ws");

sendButton.onclick = sendMessage;


var Message = {
    message: "",
    time: "",
    author: ""
}

var userName = prompt("Как мне лучше звать вас?", []);
var jsonFile = "";

document.addEventListener('keydown', function(event){
  if (event.code == 'Enter'){
      sendMessage();
  }
});

function sendMessage(){
    if(sendText.value !== ""){
        let date = new Date();
        Message.message = sendText.value;
        Message.time = `${date.getHours()}:${date.getMinutes()}`;
        Message.author = userName;
        socket.send(JSON.stringify(Message));
        sendText.value = '';
    }
}

socket.onopen = function() {
  console.log(`Соединение с сервером ${location.host} по протоколу Websocket установлено`);
};

socket.onmessage = function(event) {
  jsonFile = JSON.parse(event.data);
  var messageEl = document.createElement('div');
    messageEl.className = (jsonFile.author == userName) ? "col-auto text-break text-center px-4 rounded shadow-lg bg-light align-self-end" : "col-auto text-break text-center px-4 rounded shadow-lg bg-ligth align-self-start";
    messageEl.innerHTML = `<p class="fst-italic fs-2">${jsonFile.message}</p> <p class="fst-italic fw-light fs-4 text-secondary opacity-75">${ jsonFile.author} : ${ jsonFile.time}</p></div>`;
  messageStack.appendChild(messageEl);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`Соединение закрыто, код=${event.code} причина=${event.reason}`);
  } else {
    console.log('Соединение прервано');
  }
};

socket.onerror = function(error) {
    console.log(`[error] ${error.message}`);
};