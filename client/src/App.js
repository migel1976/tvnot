import React, { Component } from 'react';

class App extends Component {

    constructor (props) {
	super(props);
	this.state = { status: 'no status' };
    }
    
    setSocketListeners () {
	this.props.socket.on('key_status', (status) => {
	    console.log("received test_message", status);
	    this.setState({channel: status.channel, status: status.status})
	});
    }

    componentDidMount () {
	this.setSocketListeners();
    }

    render () {
	return (
	    <div>
		<div>{this.state.channel} ==> {this.state.status}</div>
		<br/>
		<table>
		<tr><td>{this.state.channel}</td><td>{this.state.status}</td></tr>
		<tr><td>{this.state.channel}</td><td>{this.state.status}</td></tr>
		</table>
		</div>
		
	);
    }
};	    

export default App;
