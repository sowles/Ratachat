function changeMainViews(view) {
  document.querySelectorAll(".main .main__section").forEach((el) => {
    el.classList.add("main__section--hidden");
  })
  document.querySelector(`.main .main__section.main__${view}`).classList.remove("main__section--hidden");
}

document.querySelectorAll(".button[data-action='create']").forEach((el) => {
  el.addEventListener("click", () => {
    changeMainViews("create");
  });
});

document.querySelectorAll(".button[data-action='join']").forEach((el) => {
  el.addEventListener("click", () => {
    // get recent rooms list
    changeMainViews("join");
  });
});

document.querySelectorAll(".button[data-action='goToSplash']").forEach((el) => {
  el.addEventListener("click", () => {
    changeMainViews("splash");
  });
});


function randomCode(min, max) {
  let ranNum = Math.random() * (max - min) + min;
  return String(Math.floor(ranNum));
}

let firebaseDB;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    firebaseDB = firebase.firestore();
    user = user.uid;
    loadRecentRooms();
    loadMostRecentNickname();
  }
  else {
    firebase.auth().signInAnonymously().catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error!");
    });
  }
});

async function loadRecentRooms() {
  let recentRoomsList = JSON.parse(localStorage.getItem("recentRoomsList") || "[]");
  const recentRoomsContainer = document.querySelector(".main__join__roomList");
  const recentRoomsLoader = document.querySelector(".main__join__roomList__loader");
  const codeInput = document.querySelector("#join__enterCode");
  for (let i = 0; i < recentRoomsList.length; i++) { // most recent is shown first
    // make sure room still exists, if not remove from array
    let room = recentRoomsList[i];
    let roomDoc;
    try {
      roomDoc = await firebaseDB.collection("rooms").doc(room.code).get();
    }
    catch (error) {
      alert(`Error: ${error}`);
    }
    if (!roomDoc.exists) {
      recentRoomsList.splice(i, 1);
    }
  }
  // save new array
  window.localStorage.setItem("recentRoomsList", JSON.stringify(recentRoomsList));


  for (let i = 0; i < recentRoomsList.length; i++) {
    // use new array to actually show recent rooms. 
    // this implementation is not ideal BUT max length of array is 5, so performance hit is negligable, plus big O is linear anyway.
    let room = recentRoomsList[i];

    const item = document.createElement("button");
    item.classList.add("recentRoomItem");
    item.role = "button";
    item.type = "button";
    item.textContent = room.code;
    item.addEventListener("click", () => {
      codeInput.value = room.code;
    })
    recentRoomsContainer.appendChild(item);

  }

  recentRoomsLoader.classList.remove("main__join__roomList__loader--visible");

  // if still some non-deleted rooms in list, show section
  if (recentRoomsList.length > 0) {
    recentRoomsContainer.classList.add("main__join__roomList--visible");
  }

}

function loadMostRecentNickname() {
  document.querySelectorAll(".nicknameInput").forEach((el) => {
    el.value = window.localStorage.getItem("mostRecentNickname");
  });
}

async function createRoom(event) {
  event.preventDefault();
  loaderWrap.classList.remove("hidden");
  const nickname = document.querySelector("#create__enterNickname").value;
  let roomCode = randomCode(1000, 9909);
  try {
    await firebaseDB.collection("rooms").doc(roomCode).set({
      created: true
    });
    await firebaseDB.collection("messages").add({
      timestamp: new Date(),
      nickname: nickname,
      content: "Room code: " + roomCode,
      room: roomCode
    });
    window.localStorage.setItem("mostRecentNickname", nickname);
    window.location = `chat.html?room=${roomCode}&nickname=${nickname}`;
  }
  catch(error) {
    alert(`Error: ${error}`);
    loaderWrap.classList.add("hidden");
  }
  // move them to chat page, give chat page nickname
}

async function joinRoom(event) {
  event.preventDefault();
  loaderWrap.classList.remove("hidden");
  const nickname = document.querySelector("#join__enterNickname").value;
  const roomCode = document.querySelector("#join__enterCode").value;
  let room;
  try {
    room = await firebaseDB.collection("rooms").doc(roomCode).get();
    if (!room.exists) {
      alert("That room doesn't exist");
      loaderWrap.classList.add("hidden");
    }
    else if (!nickname) {
      alert("Enter your name man");
      loaderWrap.classList.add("hidden");
    }
    else {
      window.localStorage.setItem("mostRecentNickname", nickname);
      window.location = `chat.html?room=${roomCode}&nickname=${nickname}`;
    }
  }
  catch(error) {
    alert(`Error: ${error}`);
    loaderWrap.classList.add("hidden");
  }

}
