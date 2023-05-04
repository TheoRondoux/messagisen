import React from 'react';
import { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase'
import { collection, addDoc, query, where, Timestamp, onSnapshot, doc, getDoc } from "firebase/firestore";
import '../styles/App.css';
import ConversationOverview from './ConversationOverview';

/**
 * Conversation Object
 * @constructor (convId, lastMessageId, name, ownerId)
 * @function getConvId() returns the conversation's id
 * @function getLastMessageId returns the Id of the last message sent on the conversation
 * @function getName() returns the name of the conversation
 * @function ownerId() returns the id of the owner of the conversation
 */
class Conversation{
  constructor(convId, lastMessageId, name, ownerId){
    this.convId = convId;
    this.lastMessageId = lastMessageId;
    this.name = name;
    this.ownerId = ownerId;
  }
  getConvId(){
    return this.convId;
  }
  getLastMessageId(){
    return this.lastMessageId;
  }
  getName(){
    return this.name;
  }
  getOwnerId(){
    return this.ownerId;
  }
}

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

    var message_data = {
      message: message,
      convId: convId,
      deleted: false,
      senderId: senderId,
      timestamp: Timestamp.fromDate(new Date())
    }
    try {
      addDoc(ref, message_data);
      setMessage("");
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  }
}

/**
 * Retrieves all the conversations where the user is invited to
 * @param {String} senderId is the current user id
 * @param {Function} setConvsId is the state function to update the id list
 */
function getConvsId(senderId, setConvsId){
  var tempConvsId = []
  const getUserConvQ = query(collection(firestore, "added_users"), where("userId", "==", senderId));
  onSnapshot(getUserConvQ, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      tempConvsId.push(doc.data().convId);
    });
    setConvsId(tempConvsId)
  });
}

/**
 * Function to get information about conversations
 * @param {[String]} convsId is the array containing all the ids for the conversations
 * @returns an array of promises with information about all the different conversations
 */
function getConvsProm(convsId){
  var convsPromises = [];
  convsId.forEach((convId) => {
    convsPromises.push(readConvDetails(convId));
  });
  return convsPromises;
}

/**
 * Asynchronous function to retrieve the details of a conversation
 * @param {String} convId is the id of the needed conversation
 * @returns an object containing all the data 
 */
async function readConvDetails(convId){
  var docRef = doc(firestore, "conversation", convId);
  const docSnap = await getDoc(docRef)
  return docSnap.data();
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
  return unsubscribe;
}

function showConv(){
  document.querySelector("#messages-list").style.display = "flex";
  document.querySelector("#conv-footer").style.display = "flex";
}

function App() {
  var unsub = null;

  const senderId = "Admin";

  const [convId, setConvId] = useState("");
  const [message,setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [convTitle, setConvTitle] = useState("");
  const [convsId, setConvsId] = useState([]);
  const [convs, setConvs] = useState([]);
  
  useEffect(() => {
    if (unsub !== null){
      unsub();
    }
    unsub = getMessages(convId, setMessages);
  }, [convId]);

  useEffect(() => {
    document.querySelector("#messages-list").scrollTo(0, document.querySelector("#messages-list").scrollHeight);
  }, [messages]);

  useEffect(() => {
    getConvsId(senderId, setConvsId);
  }, [])

  useEffect(() => {
    var convsProm = getConvsProm(convsId);
    Promise.all(convsProm).then((array) => {
      var tempConvs = [];
      for(var i = 0; i < array.length; i++){
        tempConvs.push(new Conversation(convsId[i], array[i].lastMessage, array[i].name, array[i].ownerId))
      }
      setConvs(tempConvs);
    });
  }, [convsId]);

  useEffect(() => {
    console.log(convs);
  }, [convs])

  return (
    <div>
      {/* <div className='app-header'>
        <h2>Messag'ISEN</h2>
      </div> */}
      <div className="app">
        <div id="conv-list">
          <h2>Conversations</h2>
          {convs.map((conv) => {
            return(
              <ConversationOverview id={conv.getConvId()} key={conv.getConvId()} name={conv.getName()} last_message={conv.getLastMessageId()} onClick={() => {
                document.querySelectorAll(".conv-overview").forEach((tempConv) => {
                  tempConv.classList.remove("selected");
                });
                document.getElementById(conv.getConvId()).classList.add("selected");
                setConvId(conv.getConvId());
                setConvTitle(conv.getName());
                showConv();
                }
              }/>
            );
          })}
        </div>
        <div id="show-conv">
          <div id="conv-header">
            <h2>{convTitle}</h2>

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