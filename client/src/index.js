import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import io from 'socket.io-client'
const socket = io('http://localhost:8080') // dev mode, exact path requiered 
//const socket = io('/') // prod mode

ReactDOM.render(<App socket={socket} />, document.getElementById('root'))
