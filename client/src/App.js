import React from 'react';
import {
  Grid,
  Table,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-bootstrap4';

class App extends React.PureComponent {
    constructor (props) {
	super(props);
	this.columns = [ {name: 'topic', title: 'Topic'},
			 {name: 'message', title: 'Message'},
			 {name: 'status', title: 'Status'}];
	this.state = {
	    columns: this.columns,
	    rows: []
	}
    }
    
    setSocketListeners () {
	this.props.socket.on('topics', (topic_messages) => {
	    console.log("received", topic_messages);
	    const rows = topic_messages;
	    this.setState({columns: this.columns, rows: rows});
	});
    }

    componentDidMount () {
	this.setSocketListeners();
    }

    render () {
    const { rows, columns } = this.state;

    return (
	    <div className="card">
            <Grid
        rows={rows}
        columns={columns}
            >
            <Table />
            <TableHeaderRow />
            </Grid>
	    </div>
    );
    }
};	    

export default App;
