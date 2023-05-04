import React from 'react';
import "../styles/ConversationOverview.css";

function ConversationOverview(props){

    return(
        <div id={props.id} className="conv-overview" onClick={props.onClick}>
            <h3>{props.name}</h3>
            <p>{props.last_message}</p>
        </div>
    )
}

export default ConversationOverview;