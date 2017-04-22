import sqlite3
import sys

from flask import Flask, render_template, jsonify, Blueprint

from switch_checker.config import ZIP_CODE_API_KEY, GOOGLE_API_KEY


bp = Blueprint('switch_checker_blueprint', __name__, template_folder='templates', static_folder='static')

########################################################
########################################################
##
## User-facing endpoints
##
########################################################
########################################################

@bp.route("/")
def index():
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

@bp.route("/stores")
def stores():
    database_path = 'switch_checker/stores.db'
    select_string = "select * from stores where date_checked = (select max(date_checked) from stores);"
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    results = c.execute(select_string)
    # put the results into an easier-to-work with dict
    store_list = [dict((results.description[i][0], value) for i, value in enumerate(row)) for row in results.fetchall()]

    return jsonify(store_list)

app = Flask(__name__)
app.register_blueprint(bp, url_prefix='/switch_checker')


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        debug = True
    else:
        debug = False
    app.run(host='0.0.0.0', port=5001, debug=debug)
    
