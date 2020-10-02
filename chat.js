let firebaseDB;
const urlParams = new URLSearchParams(window.location.search);
const chatContainer = document.querySelector(".main__section.main__chat");

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
    alert(`Fuck! Error: ${error}`);
  }

  if (!room.exists) {
    window.location = "index.html";
  }
  // get all messages in room
  let messages;
  try {
    messages = await firebaseDB.collection("rooms").doc(roomCode).collection("messages").orderBy("timestamp", "asc").get();
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
  }
  catch(error) {
    alert(`Fuck! Error: ${error}`);
  }

}


// Test
//alert(roomCode);


// Get room chats-stuffs, etc
// TODO

// delete when user leaves
window.onbeforeunload = function (deleteChat) {
  firebasedDB.collection("rooms").doc(roomCode).delete().then(function() {
      console.log("Document successfully deleted!");
  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });
}
