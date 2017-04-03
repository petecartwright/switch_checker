"""
"""

import sqlite3
import datetime

from flask import Flask, render_template
app = Flask(__name__)


def get_todays_opening_time(store):
    ''' take a best buy store dict
        return the time it opens today'''
    today = datetime.datetime.today().strftime('%Y-%m-%d')
    for day in store['detailedHours']:
        if day['date'] == today:
            return day['open']
 
    return '00:00'


def get_store_info_string(store):
    """ Take a Best Buy store dict 
        Return a string suitable for printing as output
    """

    model_name = store['model_name']
    store_name = store['store_name']
    address = store['address']
    city = store['city']
    region = store['region']
    distance_from_zip = store['distance_from_zip']
    open_time = store['open_at']
    zip_code = store['search_zip']

    info_string = u"""<br>
           Model Name: {model_name}<br>
           Store Name: {store_name}<br>
              Address: {address}<br>
                 City: {city}<br>
               Region: {region}<br>
                  Zip: {zip_code}<br>
             Opens At: {open_time}<br>
           Miles away: {distance_from_zip}<br>
            """.format(model_name=model_name, store_name=store_name, address=address, city=city, region=region, zip_code=zip_code, open_time=open_time, distance_from_zip=distance_from_zip)
    info_string = info_string + u'\n------------------------------------------------------------------'

    return info_string


@app.route("/")
def bestbuy():
    # database_path = '/home/pete/sites/switch_checker/stores.db'
    database_path = 'stores.db'
    today = datetime.datetime.today().strftime("%Y-%m-%d")
    select_string = "select * from stores where date_checked = '{today}'".format(today=today)
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    results = c.execute(select_string)
    # put the results into an easier-to-work with dict
    store_list = [dict((results.description[i][0], value) for i, value in enumerate(row)) for row in results.fetchall()]

    within_25_miles = [x for x in store_list if float(x['distance_from_zip']) <= 25]
    within_50_miles = [x for x in store_list if float(x['distance_from_zip']) <= 50]
    within_100_miles = [x for x in store_list if float(x['distance_from_zip']) <= 100]

    return render_template('index.html',
                           store_list=store_list,
                           within_25_miles=within_25_miles
                          )


if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True)
