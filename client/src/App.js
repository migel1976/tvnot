import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  TreeDataState,
  CustomTreeData,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableTreeColumn,
} from '@devexpress/dx-react-grid-material-ui';

//
// ll is subpath of rr. I.e ll is parent of rr
//
// NOTE right implementation should give /a /a/c/cc give false, /a /a/c should give true
//
function subpath_of(ll, rr) {
    var ret = null;
    if (ll) {
	//console.log("ll rr rr-1:", ll, rr, rr.split("/").splice(-1,1).join("/"));
	let rrm1 = rr.split("/"); rrm1.pop();
	ret = ll.split("/").join("/") === rrm1.join("/");
    } else {
	ret = rr.split("/").length === 2;
    }
    //console.log("subpath_of:", ll, rr, ret);
    return ret;
}

const getChildRows = (row, rootRows) => {
    //const childRows = rootRows.filter(r => r.parentId === (row ? row.id : null));
    //return childRows.length ? childRows : null;
    const row_topic = row ? row.topic : null
    const childRows = rootRows.filter(r => subpath_of(row_topic, r.topic))
    //console.log("getChildRows:", childRows);
    return childRows.length ? childRows : null;

    //console.log("getChildRows:", row, rootRows);
    //return row ? null : rootRows;
};

class App extends React.PureComponent {
    constructor (props) {
	super(props);
	this.columns = [ {name: 'topic', title: 'Topic'},
			 {name: 'message', title: 'Message'},
			 {name: 'status', title: 'Status'}];
	this.tableColumnExtensions = [{ columnName: 'topic', width: 300 }];
	this.state = {
	    columns: this.columns,
	    tableColumnExtensions: this.tableColumnExtensions,
	    rows: []
	}
    }
    
    setSocketListeners () {
	this.props.socket.on('topics', (topic_messages) => {
	    console.log("received", topic_messages);
	    const rows = topic_messages;
	    this.setState({columns: this.columns, tableColumnExtensions: this.tableColumnExtensions, rows: rows});
	});
    }

    componentDidMount () {
	this.setSocketListeners();
    }

    render () {
	return (
		<Paper>
		<Grid
            rows={this.state.rows}
            columns={this.state.columns}
		>
		<TreeDataState />
		<CustomTreeData
            getChildRows={getChildRows}
		/>
		<Table
            columnExtensions={this.state.tableColumnExtensions}
		/>
		<TableHeaderRow />
		<TableTreeColumn
            for="topic"
		/>
		</Grid>
		</Paper>
	);
    }
};	    

export default App;
