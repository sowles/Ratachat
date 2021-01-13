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

  document.querySelector("#copyRoomCodeButtonText").textContent = roomCode;

  // add to recent rooms list
  let recentRoomsList = JSON.parse(localStorage.getItem("recentRoomsList") || "[]");

  if (!recentRoomsList.some(e => e.code == roomCode)) {
    let roomEntry = {
      code: roomCode,
      accessed: Date.now()
    }
    recentRoomsList.push(roomEntry);
  }
  else {
    recentRoomsList.filter(e => e.code == roomCode)[0].accessed = Date.now(); // update access timestamp
  }

  // sort array
  recentRoomsList.sort((a, b) => {
    return b.accessed - a.accessed;
  });

  if (recentRoomsList.length > 5) { // keep recent rooms list short, this removes last accessed room in array since it was just sorted
    recentRoomsList.pop(); // this is only place new rooms are added, so just blindly popping last item *should* be fine 99.999% of the time
  }

  window.localStorage.setItem("recentRoomsList", JSON.stringify(recentRoomsList));




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

  let answer = confirm("Are you sure you wish to delete this room and all of its messages?");
  if (!answer) {
    loaderWrap.classList.add("hidden");
    return;
  }

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

async function copyRoomCode(event) {
  try {
    await navigator.clipboard.writeText(roomCode);
    this.querySelector(".material-icons").textContent = "done_outline";
    this.classList.toggle("actionIcon--success");
    this.disabled = true;
    setTimeout(() => {
      this.querySelector(".material-icons").textContent = "content_copy";
      this.classList.toggle("actionIcon--success");
      this.disabled = false;
    }, 2500);
  }
  catch(error) {
    this.querySelector(".material-icons").textContent = "report";
    this.classList.toggle("actionIcon--danger");
    this.disabled = true;
    setTimeout(() => {
      this.querySelector(".material-icons").textContent = "content_copy";
      this.classList.toggle("actionIcon--danger");
      this.disabled = false;
    }, 2500);
    console.error(`FUCK! Error: ${error}`);
  }
}

// why not just say onclick = "X()"?????
// Don't use querySelectorAll like index bc only one element guaranteed
document.querySelector("button[data-action='deleteChat']").addEventListener("click", deleteChat); 
document.querySelector("button[data-action='copyRoomCode']").addEventListener("click", copyRoomCode);
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
