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
        <td>{this.props.store.phone_number}</td>
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
      <table className='table table-striped table-bordered'>
        <thead className='thead-inverse'>
          <tr>
            <th>Model</th>
          {/*  <th>Store Name</th> */}
            <th>Address</th>
            <th>City</th>
            <th>Zip</th>
            <th>State</th>
            <th>Phone</th>
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
  }
  render() {
    return (
      <div>
        <BBStoreTable
          stores={this.props.stores}
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


function update_intro_line(stores) {

  // stores can have multiple models - we want the distinct number of stores
  var unique_stores = new Set();

  for (store of stores){
    // I know that I'm iterating over the entire list twice (here and in generateKeys)
    // I'll fix it later when I'm smarter
    unique_stores.add(store['store_name']);
  }

  var num_stores = unique_stores.size;
  var date_checked = stores[0]['date_checked'];
  var date_formatted = moment(date_checked).format('dddd MMMM Do, YYYY')
  
  document.getElementById('num-stores').innerHTML = num_stores;
  document.getElementById('update-date').innerHTML = date_formatted;

}

var store_list;
fetch('/bestbuy/stores').then(function (response) {
      return response.json();
    }).then(function (stores) {
      store_list = stores;
      update_intro_line(stores);
      generateKeys(stores);
      ReactDOM.render(React.createElement(FilterableBBStoreTable, { stores: stores }), document.getElementById('container'));
    });














