import sqlite3
import datetime

from flask import Flask, render_template, jsonify, Blueprint

from config import ZIP_CODE_API_KEY, GOOGLE_API_KEY


bp = Blueprint('bestbuy_blueprint', __name__, template_folder='templates')

########################################################
########################################################
##
## User-facing endpoints
##
########################################################
########################################################

@bp.route("/bestbuy")
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

@bp.route("/bestbuy/stores")
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

app = Flask(__name__)
app.register_blueprint(bp, url_prefix='/bestbuy')


if __name__ == "__main__":
    app.run(host='0.0.0.0')

