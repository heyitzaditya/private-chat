import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDzFxRn51HYQADNnO-44jtpKjaoqfDbpsE",
authDomain: "privatechat-200f1.firebaseapp.com",
projectId: "privatechat-200f1",
storageBucket: "privatechat-200f1.firebasestorage.app",
messagingSenderId: "26721616197",
appId: "1:26721616197:web:d582f35bf112b11a09fe2c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = "";
let currentRoom = "";

const nameScreen = document.getElementById("nameScreen");
const roomScreen = document.getElementById("roomScreen");
const chatScreen = document.getElementById("chatScreen");

const continueBtn = document.getElementById("continueBtn");
const nameInput = document.getElementById("nameInput");

const showCreateRoom = document.getElementById("showCreateRoom");
const showJoinRoom = document.getElementById("showJoinRoom");

const createRoomSection = document.getElementById("createRoomSection");
const joinRoomSection = document.getElementById("joinRoomSection");

const createRoomCode = document.getElementById("createRoomCode");
const joinRoomCode = document.getElementById("joinRoomCode");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const roomTitle = document.getElementById("roomTitle");
const onlineStatus = document.getElementById("onlineStatus");

const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

const typingIndicator = document.getElementById("typingIndicator");

continueBtn.onclick = () => {

const name = nameInput.value.trim();

if (!name) {
alert("Enter name");
return;
}

currentUser = name;

nameScreen.classList.add("hidden");
roomScreen.classList.remove("hidden");

};

showCreateRoom.onclick = () => {
createRoomSection.classList.remove("hidden");
joinRoomSection.classList.add("hidden");
};

showJoinRoom.onclick = () => {
joinRoomSection.classList.remove("hidden");
createRoomSection.classList.add("hidden");
};

createRoomBtn.onclick = async () => {

const code = createRoomCode.value.trim();

if (!code) return;

const roomRef = doc(db, "rooms", code);

const existing = await getDoc(roomRef);

if (existing.exists()) {
alert("Room already exists");
return;
}

await setDoc(roomRef, {
createdAt: serverTimestamp()
});

enterRoom(code);

};

joinRoomBtn.onclick = async () => {

const code = joinRoomCode.value.trim();

if (!code) return;

const roomRef = doc(db, "rooms", code);

const existing = await getDoc(roomRef);

if (!existing.exists()) {
alert("Invalid Room Code");
return;
}

enterRoom(code);

};

async function enterRoom(code) {

currentRoom = code;

roomScreen.classList.add("hidden");
chatScreen.classList.remove("hidden");

roomTitle.textContent = "Waiting...";

await setDoc(
doc(db, "rooms", code, "presence", currentUser),
{
name: currentUser,
online: true,
lastSeen: serverTimestamp()
}
);

listenPresence();
listenMessages();

}


function listenPresence() {

onSnapshot(
collection(db, "rooms", currentRoom, "presence"),
(snapshot) => {

const users = [];

snapshot.forEach((docSnap) => {

const data = docSnap.data();

users.push(data);

});

const friend = users.find(
user => user.name !== currentUser
);

if (friend) {

roomTitle.textContent = friend.name;

if (friend.online) {

onlineStatus.innerHTML = "🟢 Online";

} else {

onlineStatus.innerHTML = "⚫ Offline";

}

} else {

roomTitle.textContent = "Waiting...";
onlineStatus.innerHTML = "⚫ Offline";

}

}
);

}



sendBtn.onclick = sendMessage;

messageInput.addEventListener("keypress", (e) => {

if (e.key === "Enter") {
sendMessage();
}

});

async function sendMessage() {

const text = messageInput.value.trim();

if (!text) return;

await addDoc(
collection(
db,
"rooms",
currentRoom,
"messages"
),
{
sender: currentUser,
text: text,
createdAt: serverTimestamp()
}
);

messageInput.value = "";

}

function listenMessages() {

const q = query(
collection(
db,
"rooms",
currentRoom,
"messages"
),
orderBy("createdAt")
);

let lastDate = "";

onSnapshot(q, (snapshot) => {

messagesDiv.innerHTML = "";
lastDate = "";

snapshot.forEach((docSnap) => {

const data = docSnap.data();

if (!data.createdAt) return;

const dateObj = data.createdAt.toDate();

const currentDate =
dateObj.toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
);

if (currentDate !== lastDate) {

messagesDiv.innerHTML += `
<div class="dateDivider">
${currentDate}
</div>
`;

lastDate = currentDate;

}

const time =
dateObj.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);

const mine =
data.sender === currentUser;

messagesDiv.innerHTML += `
<div class="messageRow ${mine ? "myRow" : "otherRow"}">

<div class="message ${mine ? "myMessage" : "otherMessage"}">

<div class="sender">
${data.sender}
</div>


<div class="messageInfo">
${time}
</div>

</div>

</div>
`;

});

messagesDiv.scrollTop =
messagesDiv.scrollHeight;

});

}

messageInput.addEventListener("input", () => {

typingIndicator.classList.remove("hidden");

clearTimeout(window.typingTimeout);

window.typingTimeout = setTimeout(() => {
typingIndicator.classList.add("hidden");
}, 1000);

});

window.addEventListener("beforeunload", async () => {

if (!currentRoom || !currentUser) return;

await setDoc(
doc(
db,
"rooms",
currentRoom,
"presence",
currentUser
),
{
name: currentUser,
online: false,
lastSeen: serverTimestamp()
}
);

});
