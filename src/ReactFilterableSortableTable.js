class TableRow extends React.Component {

  render() {
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

class FilterRow extends React.Component {

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



class FilterableSortableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {filter_text: '',
                  filter_column: null,
                  sort_column: null,
                  sort_direction: 1
                 };
    this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
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
    var new_sort_direction = (this.state.sort_column === sort_column) 
                                ? sort_direction * -1
                                : 1
                                ;
    this.setState({
      sort_column: sort_column,
      sort_direction: new_sort_direction
    });
   } 

  render() {
      var rows = [];  
      this.props.table_data.forEach((table_row_data) => {
        rows.push(<TableRow table_row_data={table_row_data} key={table_row_data.key} />);
      });
      <div>
        <table className='table table-striped table-bordered'>
          {/*<SortableTableHeader dlajsdnflaksdjnf /> */}
          <tbody>
            {/* <FilterRow asdklfjansdlfkjansdf/> */}
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}


// class BBStoreTable extends React.Component {
//   constructor(props) {
//     super(props);
//   }
//   render() {
    
//     var rows = [];  
//     this.props.table_data.forEach((store) => {
//       var region_lowercase = store.region.toLowerCase();
//       if (this.props.filterText){
//         var filterText_lowercase = this.props.filterText.toLowerCase();
//         if (region_lowercase.indexOf(filterText_lowercase) === -1) {
//           // if there's no matching text, don't render the row
//           return;
//         }
//       }
//       rows.push(<BBStoreRow store={store} key={store.reactKey} />);
//     });

//     return (
//       <table className='table table-striped table-bordered'>
//         <thead className='thead-inverse'>
//           <tr>
//             <th>Model</th>
//             <th>Address</th>
//             <th>Phone</th>
//             <th>City</th>
//             <th>Zip</th>
//             <th>State</th>
//           </tr>
//         </thead>
//         <tbody>{rows}</tbody>
//       </table>
//     );
//   }
// }


function sortArrayByKey(array, sort_column, sort_direction) {
  // take an array, a sort column and a direction 
  // direction = 1 => ascending, -1 => descending 
  array.sort(function(a, b){
    // return 1 if a shold be ranked higher than b, -1 otherwise
    //   these are flipped if 'direction' is set to 'desc' 
    var lower_a = (typeOf a[sort_column] === 'string') ? a[sort_column].toLowerCase() : a[sort_column];
    var lower_b = (typeOf b[sort_column] === 'string') ? b[sort_column].toLowerCase() : b[sort_column];
    
    // if a<b, return 1, elif b>a return 1, else 0
    var return_value = (lower_a < lower_b)
                          ? return_value = -1
                          : (lower_a > lower_b)
                              ? return_value = 1
                              : return_value = 0
                              ;

    return_value = return_value * sort_direction;

    return return_value;
  })
}










// TODO: move everything below this to the main file so we can generalize better

function cleanUpStoreData(stores){
  // update the model name
  // generate a google maps link + a href
  // generate a phone href
  // put the columns in the right order with the right names
  var cleaned_stores = [];

  stores.forEach((store, index) => {

    var model_name = store.model_name.replace('Nintendo - Switch™ 32GB Console - ', '')
                                     .replace('Joy-Con™', '')
                                     .replace('Neon Red', 'Red')
                                     .replace('Neon Blue', 'Blue');

    var google_map_raw_url = `https://www.google.com/maps/place/${store.address},+${store.city},+${store.search_zip}`;
    var google_map_encoded_url = encodeURI(google_map_raw_url);

    cleaned_stores.push({'Model': model_name,
                         'Address': `<a href=${google_map_encoded_url}>${store.address}</a>`,
                         'Phone': `<a href='tel:${store.phone_number}'>${store.phone_number}</a>`,
                         'City': store.city,
                         'Zip': store.search_zip,
                         'State': store.region,
                         'key': index.toString()
                         });
  });
  return cleaned_stores;
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
      ReactDOM.render(React.createElement(FilterableSortableTable, { table_data: stores }), document.getElementById('container'));
    });

