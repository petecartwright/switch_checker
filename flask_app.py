"""
"""

import sqlite3
import datetime

from flask import Flask, render_template, jsonify

from config import ZIP_CODE_API_KEY, GOOGLE_API_KEY

app = Flask(__name__)


########################################################
########################################################
##
## User-facing endpoints
##
########################################################
########################################################

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
    within_500_miles = [x for x in store_list if float(x['distance_from_zip']) <= 500]
    closest_3 = within_500_miles[:3]

    return render_template('index.html',
                           store_list=store_list,
                           within_25_miles=within_25_miles,
                           within_50_miles=within_50_miles,
                           within_100_miles=within_100_miles,
                           within_500_miles=within_500_miles,
                           closest_3=closest_3,
                           GOOGLE_API_KEY=GOOGLE_API_KEY,
                           ZIP_CODE_API_KEY=ZIP_CODE_API_KEY
                          )


########################################################
########################################################
##
## API endpoints
##
########################################################
########################################################

@app.route("/stores")
def stores():
    database_path = 'stores.db'
    today = datetime.datetime.today().strftime("%Y-%m-%d")
    select_string = "select * from stores where date_checked = '{today}'".format(today=today)
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    results = c.execute(select_string)
    # put the results into an easier-to-work with dict
    store_list = [dict((results.description[i][0], value) for i, value in enumerate(row)) for row in results.fetchall()]

    return jsonify(store_list)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
