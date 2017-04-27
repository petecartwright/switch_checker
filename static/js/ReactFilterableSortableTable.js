class TableRow extends React.Component {

  createMarkup(cell_data) {
    return;
  }

  render() {
    var cells = [];

    this.props.column_names.forEach(column_name => {
      if (column_name === 'key') {
        return;
      }
      // this is a bad solution, but I'm doing it here beause I trust
      // the incoming data. React won't render HTML unless I escape it
      // like this, and I'd like to be able to set that in advance  
      var markup = { '__html': this.props.table_row_data[column_name] };
      cells.push(React.createElement('td', { key: column_name, dangerouslySetInnerHTML: markup }));
    });
    return React.createElement(
      'tr',
      null,
      cells
    );
  }
}

class FilterRow extends React.Component {

  constructor(props) {
    super(props);
    this.onFilterTextInputChange = this.onFilterTextInputChange.bind(this);
  }

  onFilterTextInputChange(e) {
    // when we get a change in the text, tell the FilterableBBStoreTable
    // via the function that was passed in the props
    var filter_column = e.target.id.replace('filter-', '');
    var filter_text = e.target.value;
    this.props.handleFilterTextInput(filter_column, filter_text);
  }

  render() {

    var filter_cells = [];
    this.props.column_names.forEach(column_name => {
      if (column_name === 'key') {
        return;
      }
      var cell_value = column_name === this.props.filter_column ? this.props.filter_text : '';
      filter_cells.push(React.createElement(
        'td',
        { key: column_name },
        React.createElement(
          'form',
          null,
          React.createElement('input', {
            id: 'filter-' + column_name,
            type: 'text',
            placeholder: 'Filter...',
            value: cell_value,
            onChange: this.onFilterTextInputChange
          })
        )
      ));
    });

    return React.createElement(
      'tr',
      null,
      filter_cells
    );
  }
}

class SortableTableHeaderCell extends React.Component {
  constructor(props) {
    super(props);
    this.onSortColumnClick = this.onSortColumnClick.bind(this);
  }

  onSortColumnClick(e) {
    var new_sort_column = this.props.column_name;
    this.props.handleSortColumnInput(new_sort_column);
  }

  render() {

    var cell_contents = this.props.sort_column === this.props.column_name ? this.props.sort_direction === 1 ? this.props.column_name + ' ▲' : this.props.column_name + ' ▼' : this.props.column_name;

    return React.createElement(
      'th',
      { onClick: this.onSortColumnClick },
      cell_contents
    );
  }
}

class SortableTableHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var cells = [];
    this.props.column_names.forEach(column_name => {
      // don't render the key column
      if (column_name === 'key') {
        return;
      }
      cells.push(React.createElement(SortableTableHeaderCell, {
        column_name: column_name,
        key: column_name,
        handleSortColumnInput: this.props.handleSortColumnInput
      }));
    });
    return React.createElement(
      'thead',
      { className: 'thead-inverse' },
      React.createElement(
        'tr',
        null,
        cells
      )
    );
  }
}

class FilterableSortableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filter_text: '',
      filter_column: null,
      sort_column: null,
      sort_direction: 1
    };
    this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
    this.handleSortColumnInput = this.handleSortColumnInput.bind(this);
  }

  handleFilterTextInput(filter_column, filter_text) {
    this.setState({
      filter_text: filter_text,
      filter_column: filter_column
    });
  }

  handleSortColumnInput(sort_column) {

    // if this column is already being sorted, this should flip the sort order
    // if not, default to 1 (ascending)
    var new_sort_direction = this.state.sort_column === sort_column ? this.state.sort_direction * -1 : 1;
    this.setState({
      sort_column: sort_column,
      sort_direction: new_sort_direction
    });
  }

  render() {

    // if there's a sort column set, sort the list!
    if (this.state.sort_direction) {
      // I probably shouldn't be sorting the props directly.
      sortArrayByKey(this.props.table_data, this.state.sort_column, this.state.sort_direction);
    }

    // we'll be using the list of columns to build the header and filter row
    var column_names = Object.keys(this.props.table_data[0]);
    var rows = [];
    this.props.table_data.forEach(table_row_data => {
      if (this.state.filter_text) {
        var filter_text_lowercase = this.state.filter_text.toLowerCase();
        var cell_value_lowercase = table_row_data[this.state.filter_column].toLowerCase();
        if (cell_value_lowercase.indexOf(filter_text_lowercase) === -1) {
          // if there's no matching text, don't render the row
          return;
        }
      }
      rows.push(React.createElement(TableRow, {
        column_names: column_names,
        table_row_data: table_row_data,
        key: table_row_data.key
      }));
    });

    return React.createElement(
      'div',
      null,
      React.createElement(
        'table',
        { className: 'table table-striped table-bordered' },
        React.createElement(SortableTableHeader, {
          column_names: column_names,
          sort_column: this.state.sort_column,
          sort_direction: this.state.sort_direction,
          handleSortColumnInput: this.handleSortColumnInput
        }),
        React.createElement(
          'tbody',
          null,
          React.createElement(FilterRow, {
            column_names: column_names,
            filter_column: this.state.filter_column,
            filter_text: this.state.filter_text,
            handleFilterTextInput: this.handleFilterTextInput
          }),
          rows
        )
      )
    );
  }
}

function sortArrayByKey(array, sort_column, sort_direction) {
  // take an array, a sort column and a direction 
  // direction = 1 => ascending, -1 => descending 
  array.sort(function (a, b) {
    // return 1 if a shold be ranked higher than b, -1 otherwise
    //   these are flipped if 'direction' is set to 'desc' 
    var lower_a = typeof a[sort_column] === 'string' ? a[sort_column].toLowerCase() : a[sort_column];
    var lower_b = typeof b[sort_column] === 'string' ? b[sort_column].toLowerCase() : b[sort_column];

    // if a<b, return 1, elif b>a return 1, else 0
    var return_value = lower_a < lower_b ? return_value = -1 : lower_a > lower_b ? return_value = 1 : return_value = 0;

    return_value = return_value * sort_direction;

    return return_value;
  });
}