class BBStoreRow extends React.Component {

  render() {
    // format the model name so it doesn't take up a huge amount of space
    var model_name = this.props.store.model_name.replace('Nintendo - Switch™ 32GB Console - ', '')
                                                .replace('Joy-Con™', '')
                                                .replace('Neon Red', 'Red')
                                                .replace('Neon Blue', 'Blue');
    var google_map_raw_url = `https://www.google.com/maps/place/${this.props.store.address},+${this.props.store.city},+${this.props.store.search_zip}`
    var google_map_encoded_url = encodeURI(google_map_raw_url)

    return (
      <tr>
        <td>{model_name}</td>
        <td><a href={google_map_encoded_url}>{this.props.store.address}</a></td>
        <td><a href={`tel:${this.props.store.phone_number}`}>{this.props.store.phone_number}</a></td>
        <td>{this.props.store.city}</td>
        <td>{this.props.store.search_zip}</td>
        <td>{this.props.store.region}</td>
        
      </tr>
    );
  }
}


class BBStoreTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var stores = this.props.stores;
    var rows = [];  
    stores.forEach((store) => {
      var region_lowercase = store.region.toLowerCase();
      if (this.props.filterText){
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
            <th>Address</th>
            <th>Phone</th>
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

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    // so the handleFilterTextInputChange function has access to 'this'
    this.handleFilterTextInputChange = this.handleFilterTextInputChange.bind(this);
  }

  handleFilterTextInputChange(e) {
    // when we get a change in the text, tell the FilterableBBStoreTable
    // via the function that was passed in the props
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

    // if the 'direction' is set to desc, we return the inverse
    return_value = (direction === 'asc') ? return_value : return_value * -1;

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
  // update the text on the main page that 
  // tells us how many stores have switches and the date

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


fetch('/switch_checker/stores').then(function (response) {
      return response.json();
    }).then(function (stores) {
      update_intro_line(stores);
      generateKeys(stores);
      ReactDOM.render(React.createElement(FilterableBBStoreTable, { stores: stores }), document.getElementById('container'));
    });

