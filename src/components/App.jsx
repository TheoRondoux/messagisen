import React from 'react';
import { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase'
import { collection, addDoc, query, where, Timestamp, onSnapshot } from "firebase/firestore";
import '../styles/App.css';
import Conversation from './Conversation';

/**
 * Message object
 * @constructor (id, message, author, timestamp)
 * @function getId() to get the message's id
 * @function getContent() to get the message text
 * @function getAuthor() returns the author's id
 * @function getTimestamp() to have the timestamp of the sent message
 */
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

/**
 * Function called when a message is sent
 * @param {String} message is a state that contains the content of the message
 * @param {Function} setMessage is the state function to modify the message state
 * @param {String} convId is the conversation id where the message will be send to
 * @param {String} senderId is the id of the sender
 */
function handleSubmit(message, setMessage, convId, senderId){
  if (message !== ""){
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
}

/**
 * Function to retrieve all the messages from a conversation
 * @param {String} convId is the conversation to consult
 * @param {Function} setMessages is the state function to set all the messages to display 
 */
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

function showConv(){
  document.querySelector("#messages-list").style.display = "flex";
  document.querySelector("#conv-footer").style.display = "flex";
}

function App() {
  // const convId = "4TKVkbk2foxmK8eGl0Xq";
  const senderId = "Admin";

  const [convId, setConvId] = useState("");
  const [message,setMessage] = useState("");
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    getMessages(convId, setMessages);
  }, [convId]);

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
          <h2>Conversations</h2>
          <Conversation id="4TKVkbk2foxmK8eGl0Xq" name="First Conv" last_message="salut!" onClick={() => {
            setConvId("4TKVkbk2foxmK8eGl0Xq");
            showConv();}}/>
        </div>
        <div id="show-conv">
          <div id="conv-header">
            <h2>Conversation</h2>

          </div>
          <div id='messages-list'> 
            {messages.map((message) => {
              return(
                <div key={message.getId()} id={message.getId()} className={message.getAuthor() === senderId ? "mess-auth" : "mess-rec"}>
                  <h4>{message.getAuthor() + ": "}</h4>
                  <p>{message.getContent()}</p>              
                </div>
              );
            })}
          </div>
          <div id="conv-footer">
            {/* <textarea id="mess-input" rows="1" ></textarea> */}
            <input id="mess-input" type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Aa'/>
            <button id="send-message-btn" onClick={() => handleSubmit(message, setMessage, convId, senderId)}>
              <svg width="40px" height="40px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#ff0000" strokeWidth="0.096"></g><g id="SVGRepo_iconCarrier"> <path d="M20 4L3 9.31372L10.5 13.5M20 4L14.5 21L10.5 13.5M20 4L10.5 13.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;