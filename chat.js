let firebaseDB;
const urlParams = new URLSearchParams(window.location.search);

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
  // get room chats/etc
}


// Test
//alert(roomCode);


// Get room chats-stuffs, etc
// TODO
