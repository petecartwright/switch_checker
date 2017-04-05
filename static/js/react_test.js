class BBStoreRow extends React.Component {

  render() {
    var model_name = this.props.store.model_name.replace('Nintendo - Switch™ 32GB Console - ', '').replace('Joy-Con™', '');
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
      rows.push(React.createElement(BBStoreRow, { store: store, key: store.reactKey }));
    });
    return React.createElement(
      'table',
      null,
      React.createElement(
        'thead',
        null,
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

class FilterableBBStoreTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
      inStockOnly: false
    };

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

fetch('/bestbuy/stores').then(function (response) {
  return response.json();
}).then(function (stores) {
  var num_stores = stores.length;
  var date_checked = stores[0]['date_checked'];
  document.getElementById('num-stores').innerHTML = num_stores;
  document.getElementById('update-date').innerHTML = date_checked;
  generateKeys(stores);
  ReactDOM.render(React.createElement(FilterableBBStoreTable, { stores: stores }), document.getElementById('container'));
});