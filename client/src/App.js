import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';

//function createRows() {
//    const rows = [];
//    const row = { topic: '/a', message: 'Hello',
//		  children: [{topic: '/a/b', message: 'Hello Hello', children: [
//		      {topic: '/a/b/c', message: 'Hello Hello Hello'}]}]};
//    rows.push(row);
//    const row1 = { topic: '/B', message: 'Hello',
//		  children: [{topic: '/B/b', message: 'Hello Hello', children: [
//		      {topic: '/B/b/c', message: 'Hello Hello Hello'}]}]};
//    
//    rows.push(row1);
//    return rows;
//}

function createRowsFromTopicMessages(topic_messages) {
    return Object.entries(topic_messages).map(topic_message_el => {
	var topic_message = topic_message_el[1];
	return topic_message;
    });
}

const CellTextColorFormatter = (cell) => {    
    var bg = null;
    if (!cell.value.bg || cell.value.bg === '') {
	bg = 'white';
    } else {
	bg = cell.value.bg;
    }
    var label = cell.value.text;
    //console.log("CellColorFormatter:", value);
    return (<div style={{backgroundColor:bg}}>{label}</div>);    
}

const columns = [
    {
	key: 'topic',
	name: 'topic'
    },
    {
	key: 'status',
	name: 'Status',
	formatter: CellTextColorFormatter 
    },
    {
	key: 'message',
	name: 'message',
	formatter: CellTextColorFormatter 
    }
];


class App extends Component {
    constructor (props) {
	super(props);
	const rows = createRowsFromTopicMessages([]);
	this.state = { expanded: {}, rows };
    }
    
    setSocketListeners () {
	this.props.socket.on('topics', (topic_messages) => {
	    console.log("received", topic_messages);
	    const expanded = { ...this.state.expanded };
	    const rows = createRowsFromTopicMessages(topic_messages);
	    this.setState({expanded, rows});
	});
    }

    componentDidMount () {
	this.setSocketListeners();
    }

    getRows = (i) => {
	return this.state.rows[i];
    };

    getSubRowDetails = (rowItem) => {
	const isExpanded = this.state.expanded[rowItem.topic] ? this.state.expanded[rowItem.topic] : false;
	return {
	    group: rowItem.children && rowItem.children.length > 0,
	    expanded: isExpanded,
	    children: rowItem.children,
	    field: 'topic',
	    treeDepth: rowItem.treeDepth || 0,
	    siblingIndex: rowItem.siblingIndex,
	    numberSiblings: rowItem.numberSiblings
	};
    };

    onCellExpand = (args) => {
	const rows = this.state.rows.slice(0);
	const rowKey = args.rowData.topic;
	const rowIndex = rows.indexOf(args.rowData);
	const subRows = args.expandArgs.children;

	const expanded = { ...this.state.expanded };
	if (expanded && !expanded[rowKey]) {
	    expanded[rowKey] = true;
	    this.updateSubRowDetails(subRows, args.rowData.treeDepth);
	    rows.splice(rowIndex + 1, 0, ...subRows);
	} else if (expanded[rowKey]) {
	    expanded[rowKey] = false;
	    rows.splice(rowIndex + 1, subRows.length);
	}

	this.setState({ expanded, rows });
    };

    updateSubRowDetails = (subRows, parentTreeDepth) => {
	const treeDepth = parentTreeDepth || 0;
	subRows.forEach((sr, i) => {
	    sr.treeDepth = treeDepth + 1;
	    sr.siblingIndex = i;
	    sr.numberSiblings = subRows.length;
	});
    };

    render () {
	return (
		<ReactDataGrid
            enableCellSelect
            columns={columns}
            rowGetter={this.getRows}
            rowsCount={this.state.rows.length}
            getSubRowDetails={this.getSubRowDetails}
            minHeight={500}
            onCellExpand={this.onCellExpand}
		/>
	);	
    }
};	    

export default App;
