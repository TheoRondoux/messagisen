import React from 'react';
import { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase'
import { collection, addDoc, query, where, Timestamp, onSnapshot } from "firebase/firestore";
import '../styles/App.css';

class Message{
  constructor(id, message, author, timestamp){
    this.id = id;
    this.content = message;
    this.author = author;
    this.timestamp = timestamp;
  }
  getId(){
    return this.id;
  }
  getContent(){
    return this.content;
  } 
  getAuthor(){
    return this.author;
  }
  getTimestamp(){
    return this.timestamp;
  }
}

function handleSubmit(message, setMessage, convId, senderId){
  const ref = collection(firestore, "messages");

  var data = {
    message: message,
    convId: convId,
    deleted: false,
    senderId: senderId,
    timestamp: Timestamp.fromDate(new Date())
  }
  try {
    addDoc(ref, data);
    setMessage("");
  } catch (err) {
    console.error("Error adding document: ", err);
  }
}

async function getMessages(convId, setMessages){
  const q = query(collection(firestore, "messages"), where("convId", "==", convId));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    var messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(new Message(doc.id, doc.data().message, doc.data().senderId, doc.data().timestamp.seconds * 1000));
    });
    messages.sort(function(x, y){
      return x.timestamp - y.timestamp;
    });
    setMessages(messages);
  });
}

function App() {

  const convId = "4TKVkbk2foxmK8eGl0Xq";
  const senderId = "Admin";

  const [message,setMessage] = useState('');
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    getMessages(convId, setMessages);
  }, []);

  useEffect(() => {
    document.querySelector("#messages-list").scrollTo(0, document.querySelector("#messages-list").scrollHeight);
  }, [messages]);

  return (
    <div>
      {/* <div className='app-header'>
        <h2>Messag'ISEN</h2>
      </div> */}
      {/* <button onClick={() => getMessages(convId, setMessages)}>Actualiser</button> */}
      <div className="app">
        <div id="conv-list">
          <h3>Conversations</h3>
        </div>
        <div id="show-conv">
          <div id="conv-header">
            <h2>Conversation</h2>
          </div>
          <div id='messages-list'> 
            {messages.map((message) => {
              return(
                <div key={message.getId()} id={message.getId()} className={message.getAuthor() == senderId ? "mess-auth" : "mess-rec"}>
                  <h4>{message.getAuthor() + ": "}</h4>
                  <p>{message.getContent()}</p>              
                </div>
              );
            })}
          </div>
          <div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={() => handleSubmit(message, setMessage, convId, senderId)}>Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
