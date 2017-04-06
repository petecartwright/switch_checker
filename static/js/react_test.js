class BBStoreRow extends React.Component {

  render() {
    var model_name = this.props.store.model_name.replace('Nintendo - Switch™ 32GB Console - ', '').replace('Joy-Con™', '').replace('Neon Red', 'Red').replace('Neon Blue', 'Blue');
    return React.createElement(
      'tr',
      null,
      React.createElement(
        'td',
        null,
        model_name
      ),
      React.createElement(
        'td',
        null,
        this.props.store.address
      ),
      React.createElement(
        'td',
        null,
        this.props.store.city
      ),
      React.createElement(
        'td',
        null,
        this.props.store.search_zip
      ),
      React.createElement(
        'td',
        null,
        this.props.store.region
      )
    );
  }
}

class BBStoreTable extends React.Component {
  constructor() {
    super();
    this.state = {
      sort_column: null,
      sort_direction: 'asc'
    };
  }
  render() {
    var rows = [];
    this.props.stores.forEach(store => {
      if (store.region.indexOf(this.props.filterText) === -1) {
        return;
      }
      rows.push(React.createElement(BBStoreRow, { store: store, key: store.reactKey }));
    });
    return React.createElement(
      'table',
      { className: 'table table-striped table-bordered' },
      React.createElement(
        'thead',
        { className: 'thead-inverse' },
        React.createElement(
          'tr',
          null,
          React.createElement(
            'th',
            null,
            'Model'
          ),
          React.createElement(
            'th',
            null,
            'Address'
          ),
          React.createElement(
            'th',
            null,
            'City'
          ),
          React.createElement(
            'th',
            null,
            'Zip'
          ),
          React.createElement(
            'th',
            null,
            'State'
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        rows
      )
    );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterTextInputChange = this.handleFilterTextInputChange.bind(this);
  }

  handleFilterTextInputChange(e) {
    this.props.onFilterTextInput(e.target.value);
  }

  render() {
    return React.createElement(
      'form',
      { className: 'search-bar' },
      React.createElement('input', { type: 'text',
        placeholder: 'Filter by State...',
        value: this.props.filterText,
        onChange: this.handleFilterTextInputChange
      })
    );
  }
}

class FilterableBBStoreTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterText: '' };
    this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
  }

  handleFilterTextInput(filterText) {
    this.setState({
      filterText: filterText
    });
  }

  render() {
    return React.createElement(
      'div',
      null,
      React.createElement(SearchBar, {
        filterText: this.state.filterText,
        onFilterTextInput: this.handleFilterTextInput
      }),
      React.createElement(BBStoreTable, {
        stores: this.props.stores,
        filterText: this.state.filterText
      })
    );
  }
}

function generateKeys(store_list) {
  // React needs a unique key for each row in the table. This generates one!
  store_list.forEach(function (currentValue, index, array) {
    store_list[index]['reactKey'] = index;
  });
  return store_list;
}

function update_intro_line(stores) {

  // stores can have multiple models - we want the distinct number of stores
  var unique_stores = new Set();

  for (store of stores) {
    // I know that I'm iterating over the entire list twice (here and in generateKeys)
    // I'll fix it later when I'm smarter
    unique_stores.add(store['store_name']);
  }

  var num_stores = unique_stores.size;
  var date_checked = stores[0]['date_checked'];
  var date_formatted = moment(date_checked).format('dddd MMMM Do, YYYY');

  document.getElementById('num-stores').innerHTML = num_stores;
  document.getElementById('update-date').innerHTML = date_formatted;
}

fetch('/bestbuy/stores').then(function (response) {
  return response.json();
}).then(function (stores) {
  update_intro_line(stores);
  generateKeys(stores);
  ReactDOM.render(React.createElement(FilterableBBStoreTable, { stores: stores }), document.getElementById('container'));
});