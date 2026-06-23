import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
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

const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const nameInput = document.getElementById("name");

const room = "bestfriendroom";

sendBtn.addEventListener("click", async () => {

const text = messageInput.value.trim();

if(!text) return;

const name = nameInput.value || "Anonymous";

await addDoc(collection(db, room), {
name,
text,
createdAt: serverTimestamp()
});

messageInput.value = "";
});

const q = query(
collection(db, room),
orderBy("createdAt")
);

onSnapshot(q, (snapshot)=>{

messagesDiv.innerHTML="";

snapshot.forEach((doc)=>{

const data = doc.data();

messagesDiv.innerHTML += `
<div class="message">
<b>${data.name}</b><br>
${data.text}
</div>
`;

});

messagesDiv.scrollTop = messagesDiv.scrollHeight;

});
