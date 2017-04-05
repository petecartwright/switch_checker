class BBStoreRow extends React.Component {

  render() {
    var model_name = this.props.store.model_name.replace('Nintendo - Switch™ 32GB Console - ','').replace('Joy-Con™','');
    return (
      <tr>
        <td>{model_name}</td>
       {/* <td>{this.props.store.store_name}</td> */}
        <td>{this.props.store.address}</td>
        <td>{this.props.store.city}</td>
        <td>{this.props.store.search_zip}</td>
        <td>{this.props.store.region}</td>
      </tr>
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
    this.props.stores.forEach((store) => {
      rows.push(<BBStoreRow store={store} key={store.reactKey} />);
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Model</th>
          {/*  <th>Store Name</th> */}
            <th>Address</th>
            <th>City</th>
            <th>Zip</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
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
    return (
      <div>
        <BBStoreTable
          stores={this.props.stores}
          filterText={this.state.filterText}
        />
      </div>
    );
  }
}

function generateKeys(store_list){
  // React needs a unique key for each row in the table. This generates one!
  store_list.forEach(function(currentValue, index, array) {
    store_list[index]['reactKey'] = index;
  })
  return store_list
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














