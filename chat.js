let firebaseDB;
const urlParams = new URLSearchParams(window.location.search);
const chatContainer = document.querySelector(".main__section.main__chat");
const loaderWrap = document.querySelector("#loaderWrap");

// return user if URL not right
if (!(urlParams.has("nickname") && urlParams.has("room"))) {
  window.location = "index.html";
}

// get URL params
const roomCode = urlParams.get("room");
const nickname = urlParams.get("nickname");

// return user if not authenticated
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    firebaseDB = firebase.firestore();
    provisionChat();
  }
  else {
    window.location = "index.html";
  }
});

async function provisionChat() {
  // check for room existence
  let room;
  try {
    room = await firebaseDB.collection("rooms").doc(roomCode).get();
  }
  catch(error) {
    alert(`You need to type stuff in. Error: ${error}`);
  }

  if (!room.exists) {
    window.location = "index.html";
  }
  // get all messages in room
  randomWittyPlaceholder();
  let messages;
  let isFirstSnapshot = true;
  firebaseDB.collection("messages").where("room", "==", roomCode).orderBy("timestamp", "asc")
    .onSnapshot((messages) => {
      // this runs every time db is updated
      while (chatContainer.firstChild) {
        chatContainer.removeChild(chatContainer.firstChild);
      }
      messages.forEach((message) => {
        // construct message markup!!!
        const chatLineType = (nickname == message.data()["nickname"]) ? "you" : "other";

        const chatLine = document.createElement("section");
        chatLine.classList.add("chatLine", "chatLine--" + chatLineType);
        chatContainer.appendChild(chatLine);

        const chatBubble = document.createElement("span");
        chatBubble.classList.add("chatBubble");
        chatBubble.textContent = message.data()["content"];
        chatLine.appendChild(chatBubble);

        const chatNickname = document.createElement("span");
        chatNickname.textContent = message.data()["nickname"];
        chatLine.appendChild(chatNickname);
      });
      document.documentElement.scrollTop = document.documentElement.scrollHeight;

      // remove spinner
      if (isFirstSnapshot) {
        loaderWrap.classList.add("hidden");
        isFirstSnapshot = false;
      }
    })

}

async function deleteChat() {
  // add spinner
  loaderWrap.classList.remove("hidden");

  try {
    await firebaseDB.collection("rooms").doc(roomCode).delete();
  }
  catch(error) {
    console.error("Fuck! Error: ", error);
  }
  try {
    var batch = firebaseDB.batch();
    const messages = await firebaseDB.collection("messages").where("room", "==", String(roomCode)).get();
    messages.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  catch(error) {
    console.error(`Fuck: ${error}`);
  }

  finally {
    window.location = "index.html";
  }
}

async function sendMessage(event) {
  event.preventDefault();
  const message = document.querySelector("#chatInput").value;
  if (message == "") {
    return;
  }
  document.querySelector("#chatInput").value = "";
  randomWittyPlaceholder();
  try {
    await firebaseDB.collection("messages").doc().set({
      timestamp: new Date(),
      nickname: nickname,
      content: message,
      room: String(roomCode)
    });
  }
  catch(error) {
    console.error("Fuck! Error: ", error);
  }
}

document.querySelector(".button[data-action='deleteChat']").addEventListener("click", deleteChat);
document.querySelector("#chatForm").addEventListener("submit", sendMessage);

function randomWittyPlaceholder() {
  let options = [
    "random", "unique", "interesting", "funny", "charming", "about yourself", "hip", "smart", "clever", "new", "wild", "distruptive"
  ]

  const randomInt = Math.floor(Math.random() * Math.floor(options.length));;
  const chatInput = document.querySelector("#chatInput");
  chatInput.placeholder = "Say something " + options[randomInt] + "...";

}

// Get room chats-stuffs, etc
// TODO
