import React from 'react';

function Conversation(props){

    return(
        <div id={props.id} className="conv-overview" onClick={props.onClick}>
            <h3>{props.name}</h3>
            <p>{props.last_mess}</p>
        </div>
    )
}

export default Conversation;