class BBStoreRow extends React.Component {

  render() {
    var model_name = this.props.store.model_name.replace('Nintendo - Switch™ 32GB Console - ', '')
                                                .replace('Joy-Con™', '')
                                                .replace('Neon Red', 'Red')
                                                .replace('Neon Blue', 'Blue');
    var google_map_raw_url = `https://www.google.com/maps/place/${this.props.store.address},+${this.props.store.city},+${this.props.store.search_zip}`
    var google_map_encoded_url = encodeURI(google_map_raw_url)

    return (
      <tr>
        <td>{model_name}</td>
       {/* <td>{this.props.store.store_name}</td> */}
        <td>
          <a href={google_map_encoded_url}>{this.props.store.address}</a></td>
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
    var stores = this.props.stores;
    if (this.state.sort_column){
      sortArrayByKey(stores, sort_column, sort_direction);
    }
    var rows = [];  
    stores.forEach((store) => {
      var region_lowercase = store.region.toLowerCase();
      if (filtertext){
        var filterText_lowercase = this.props.filterText.toLowerCase();
        if (region_lowercase.indexOf(filterText_lowercase) === -1) {
          // if there's no matching text, don't render the row
          return;
      }
    }
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

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterTextInputChange = this.handleFilterTextInputChange.bind(this);
  }

  handleFilterTextInputChange(e) {
    this.props.onFilterTextInput(e.target.value);
  }

  render() {
    return (
      <form
        className='search-bar'>
        <input 
          type='text'
          placeholder='Filter by State...'
          value={this.props.filtertext}
          onChange={this.handleFilterTextInputChange}
        />
      </form>
    )
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
    return (
      <div>
        <SearchBar
          filterText = {this.state.filterText}
          onFilterTextInput = {this.handleFilterTextInput}
        />
        <BBStoreTable
          stores={this.props.stores}
          filterText = {this.state.filterText}
        />
      </div>
    );
  }
}


function sortArrayByKey(array, sort_column, direction='asc') {
  // take an array, a sort column and an optional direction string 
  array.sort(function(a, b){
    // return 1 if a shold be ranked higher than b, -1 otherwise
    //   these are flipped if 'direction' is set to 'desc' 
    var lower_a = a[sort_column].toLowerCase();
    var lower_b = b[sort_column].toLowerCase();
    var return_value;

    if (lower_a < lower_b) {
      return_value = -1;
    } 
    else if (lower_a > lower_b) {
      return_value = 1;
    }
    else {
      return_value = 0;
    }

    if (direction === 'asc') {
      return return_value;
    } else if (direction === 'desc') {
      return return_value * -1;
    }

    return return_value;
  })
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

fetch('/bestbuy/stores').then(function (response) {
      return response.json();
    }).then(function (stores) {
      update_intro_line(stores);
      generateKeys(stores);
      ReactDOM.render(React.createElement(FilterableBBStoreTable, { stores: stores }), document.getElementById('container'));
    });














