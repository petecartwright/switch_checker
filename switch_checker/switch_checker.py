# -*- coding: utf-8 -*-
"""
Module to check the Best Buy API for available Nintendo Switches, 
because I want to buy one and am too fussy to wait for shipping.

"""
import os
import datetime
import sqlite3
import sys

import requests
 
from config import BEST_BUY_API_KEY

BASE_URL = 'https://api.bestbuy.com/v1/'
script_path = os.path.dirname(os.path.realpath(__file__))
DATABASE_FILENAME = os.path.join(script_path, 'stores.db')
# DATABASE_FILENAME = 'stores.db'

def get_bestbuy_api_key():
    """ if we have one in the config module, return that
        if not, check the environment variables
        otherwise return nothing
    """
    if BEST_BUY_API_KEY:
        return BEST_BUY_API_KEY
    else:
        return os.environ['BEST_BUY_API_KEY']

def create_database_if_missing(db_name):
    ''' If a file with the passed name doesn't exist, create it according to the schema below
    '''
    
    # if the database exists, skip the rest
    if os.path.isfile(db_name):
        return False

    # will create the database if it doesn't exist
    conn = sqlite3.connect(db_name)
    c = conn.cursor()

    table_creation_string = """ CREATE TABLE stores (
                                date_checked        text,
                                model_name          text,
                                store_name          text,
                                address             text,
                                city                text,
                                store_zip           text,
                                region              text,
                                open_at             text,
                                search_zip          text,
                                distance_from_zip   text,
                                phone_number        text
                                );
                             """
    c.execute(table_creation_string)
    
    conn.commit()
    conn.close()

    return True


def add_one_store_to_database(db_name, store):
    ''' Take a store dict and add it to the database with today's date
    '''

    today = datetime.datetime.today().strftime('%Y-%m-%d')

    store_name = store['name']
    address = store['address']
    city = store['city']
    region = store['region']
    opentime = get_todays_opening_time(store)
    distance = store['distance']
    zip_code = store['postalCode']
    phone_number = store['phone']

    # one store may have multiple products - let's get all of them!
    for p in store['products']:
        model_name = p['name']

        conn = sqlite3.connect(db_name)
        c = conn.cursor()

        c.execute(u"""INSERT INTO stores (date_checked, model_name, store_name, address, city, region, open_at, search_zip, distance_from_zip, phone_number)
                      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                   """, (today, model_name, store_name, address, city, region, opentime, zip_code, distance, phone_number)
                 )

        conn.commit()
        conn.close()

    return True


def add_all_stores_to_database(db_name, stores):
    """ Take a database, list of stores, and add them if we haven't added some already today
    """ 
    create_database_if_missing(db_name)
    # make sure we haven't aready updated the database today
    sql = 'select max(date_checked) from stores;'
    conn = sqlite3.connect(db_name)
    c = conn.cursor()
    newest_date = c.execute(sql).fetchone()[0]
    conn.close()

    today = datetime.datetime.today().strftime('%Y-%m-%d')

    if newest_date != today:
        for s in stores:
            add_one_store_to_database(db_name=db_name, store=s)
    else:
        print 'already added to the database!'


def build_initial_url(zip_code, radius_in_miles, skus, attribs_to_return, format_type, page_size):
    """ Take parameters below and return the URL for the initial page of results

        zip_code (str): zip code to center the search on. 5 digits
        radius_in_miles (str): how far to check around that zip. BB's API will sometimes give results a little farther than this value
        skus (list of str): a list of the SKUs to check. Get the SKU from the bestbuy.com page under the title, or from the URL
                            EX: http://www.bestbuy.com/site/nintendo-switch-32gb-console-gray-joy-con/5670003.p?skuId=5670003 -> SKU is 567003
        attribs_to_return: What attributes the API should return. Listing here: https://bestbuyapis.github.io/api-documentation/#detail 
                                                                      and here: https://bestbuyapis.github.io/api-documentation/#common-attributes56
        format_type (str): 'json' or 'xml'
        page_size (str): the number of records to return per page. Max 10

        TODO: this should check for valid values and have error handling
    """

    # this will only work if we have an API key
    api_key = get_bestbuy_api_key()
    if api_key == '':
        print('No API key found. Register at http://developer.bestbuy.com and add your key to config.py')
        sys.exit()

    # start building the initial URL
    stores_function = 'stores(area({zip_code},{radius}))'.format(zip_code=zip_code, radius=radius_in_miles)
    skus_string = ','.join(skus)
    products_string = '+products(sku in({skus}))'.format(skus=skus_string)
    format_string = 'format={format_type}'.format(format_type=format_type)
    show_string = 'show='+','.join(attribs_to_return)
    page_size_string = 'pageSize={page_size}'.format(page_size=page_size)
    api_key_string = 'apiKey={api_key}'.format(api_key=api_key) 

    initial_url = BASE_URL \
                  + stores_function \
                  + products_string \
                  + '?' \
                  + format_string \
                  + '&' \
                  + page_size_string \
                  + '&' \
                  + show_string \
                  + '&' \
                  + api_key_string

    return initial_url


def get_todays_opening_time(store):
    ''' take a best buy store dict
        return the time it opens today'''
    today = datetime.datetime.today().strftime('%Y-%m-%d')
    for day in store['detailedHours']:
        if day and day['date'] == today:
            return day['open']
 
    return '00:00'


def get_store_info_string(store, zip_code=None):
    """ Take a Best Buy store dict 
        Return a string suitable for printing as output
    """

    opentime = get_todays_opening_time(store)
    model_name = store['products'][0]['name']
    store_name = store['name']
    address = store['address']
    city = store['city']
    region = store['region']
    distance = store['distance']
    zip_code = store['postalCode']
    phone_number = store['phone']

    info_string = u"""
        Model Name: {model_name}
        Store Name: {store_name}
           Address: {address}
              City: {city}
               Zip: {zip_code}
             Phone: {phone}
            Region: {region}""".format(model_name=model_name, store_name=store_name, 
                                       address=address, city=city, zip_code=zip_code, 
                                       phone=phone_number, region=region)
    if opentime != '00:00':
        info_string = info_string + u"\n          Opens At: {opentime}".format(opentime=opentime)
    if zip_code:
        info_string = info_string + u"\n  Miles away: {distance}".format(distance=distance)
    info_string = info_string + u'\n------------------------------------------------------------------'

    return info_string


def main():

    zip_code = '23223'
    radius_in_miles = '5000'
    # test SKU - this is a Chromecast and should generally be in stock at a lot of places
    # skus = ['4397400']
    skus = ['5670003', '5670100']
    attribs_to_return = ['storeId', 'storeType', 'name', 'longName', 'address', 'city', 'postalCode', 
                         'region', 'phone', 'distance', 'products.name', 'products.sku', 'detailedHours']
    format_type = 'json'
    page_size = '10'

    initial_url = build_initial_url(zip_code=zip_code, 
                                    radius_in_miles=radius_in_miles, 
                                    skus=skus, 
                                    attribs_to_return=attribs_to_return, 
                                    format_type=format_type, 
                                    page_size=page_size
                                   )
    print 'Checking initial URL'
    result = requests.get(initial_url)

    if result.status_code == 200:

        best_buy_json = result.json()
        stores_with_product = best_buy_json['stores']
        num_pages = best_buy_json['totalPages']
        print ('Found {num_pages} pages of results, checking...'.format(num_pages=num_pages))
        if num_pages > 1:
            # start with the second page and get the rest
            for i in range(2, num_pages+1):
                print('Checking page {page_num}'.format(page_num=i))
                page_url = initial_url + '&page={page}'.format(page=i)
                page_result = requests.get(page_url)
                if page_result.status_code == 200:
                    page_json = page_result.json()
                    page_stores = page_json['stores']
                    stores_with_product.extend(page_stores)

        stores_sorted_by_distance = sorted(stores_with_product, key=lambda k: k['distance'])

        add_all_stores_to_database(DATABASE_FILENAME, stores_sorted_by_distance)

        # if we have any stores returned, start getting the interesting ones
        if stores_sorted_by_distance:
            total_number_of_stores = len(stores_sorted_by_distance)
            within_25_miles = [x for x in stores_sorted_by_distance if x['distance'] <= 25]
            within_50_miles = [x for x in stores_sorted_by_distance if x['distance'] <= 50]
            within_100_miles = [x for x in stores_sorted_by_distance if x['distance'] <= 100]
            closest_store = stores_sorted_by_distance[0]
            
            print('------------------------------------------------------------------------------')
            print("Found {num_stores} Switches within {radius_in_miles} miles of you".format(num_stores=total_number_of_stores, radius_in_miles=radius_in_miles))
            print("Found {within_100_miles} Switches within 100 miles of you".format(within_100_miles=len(within_100_miles)))
            print("Found {within_50_miles} Switches within 50 miles of you".format(within_50_miles=len(within_50_miles)))
            print("Found {within_25_miles} Switches within 25 miles of you".format(within_25_miles=len(within_25_miles)))
            print('------------------------------------------------------------------------------')
            print('')
            print('')
            if  within_25_miles:
                print('The options within 25 miles are:')
                print('------------------------------------------------------------------')
                for store in within_25_miles:
                    store_info = get_store_info_string(store=store, zip_code=zip_code)
                    print store_info
            else:
                print('The closest option is:')
                print('------------------------------------------------------------------')
                store_info = get_store_info_string(store=closest_store, zip_code=zip_code)
                print store_info
        else:
            print("No Best Buys with switches in stock!")

    else:
        print('Error getting the page!')


if __name__ == '__main__':
    main()
