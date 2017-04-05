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
    return render_template('index.html',
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
    app.run(host='0.0.0.0')
