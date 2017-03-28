# -*- coding: utf-8 -*-
"""
Module to check the Best Buy API for available Nintendo Switches, 
because I want to buy one and am too fussy to wait for shipping.

"""
import requests
import json
import datetime
from config import API_KEY

BASE_URL = 'https://api.bestbuy.com/v1/'

def get_todays_opening_time(store):
    ''' take a best buy store dict
        return the time it opens today'''
    today = datetime.datetime.today().strftime('%Y-%m-%d')
    for day in store['detailedHours']:
        if day['date'] == today:
            return day['open']
    return '00:00'

def main():
    zip_code = '23223'
    radius_in_miles = '500'
    # test SKU - this is a Chromecast and should generally be in stock at a lot of places
    # skus = ['4397400']
    skus = ['5670003','5670100']
    attribs_to_show = ['storeId','storeType','name','longName','address','city','region','phone','distance','products.name','products.sku','detailedHours']
    format_type = 'json'   # can be json or xml
    page_size = '10'

    # start building the initial URL
    stores_function = 'stores(area({zip_code},{radius}))'.format(zip_code=zip_code, radius=radius_in_miles)
    skus_string = ','.join(skus)
    products_string = '+products(sku in({skus}))'.format(skus=skus_string)
    format_string = 'format={format_type}'.format(format_type=format_type)
    show_string = 'show='+','.join(attribs_to_show)
    page_size_string = 'pageSize={page_size}'.format(page_size=page_size)
    api_key_string = 'apiKey={api_key}'.format(api_key=API_KEY) 

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

    result = requests.get(initial_url)

    if result.status_code == 200:

        best_buy_json = result.json()
        stores_with_product = best_buy_json['stores']
        num_pages = best_buy_json['totalPages']
        print ('Found {num_pages} of results, checking...'.format(num_pages=num_pages))
        if num_pages > 1:
            # start with the second page and get the rest
            for x in range(2,num_pages+1):
                print('Checking page {page_num}'.format(page_num=x))
                page_url = initial_url + '&page={page}'.format(page=x)
                page_result = requests.get(page_url)
                if page_result.status_code == 200:
                    page_json = page_result.json()
                    page_stores = page_json['stores']
                    stores_with_product.extend(page_stores)

        stores_sorted_by_distance = sorted(stores_with_product, key=lambda k: k['distance'])

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
                for x in within_25_miles:

                    opentime = get_todays_opening_time(x)

                    print(u'    Switch Model: {prod_name}'.format(prod_name=x['products'][0]['name']))
                    print('      Store Name: {storename}'.format(storename=x['name']))
                    print('         Address: {state}'.format(state=x['address']))
                    print('            City: {city}'.format(city=x['city']))
                    print('           State: {region}'.format(region=x['region']))
                    print('Miles from {zip}: {distance}'.format(zip=zip_code, distance=x['distance']))
                    if opentime != '00:00':
                        print('        Opens at: {opentime}'.format(opentime=opentime))
                    print('------------------------------------------------------------------')
            else:
                    opentime = get_todays_opening_time(x)

                    print('   Closest is at: {storename}'.format(storename=closest_store['name']))
                    print('         Address: {state}'.format(state=closest_store['address']))
                    print('            City: {city}'.format(city=closest_store['city']))
                    print('           State: {region}'.format(region=closest_store['region']))
                    print('Miles from {zip}: {distance}'.format(zip=zip_code, distance=closest_store['distance']))
                    if opentime != '00:00':
                        print('        Opens at: {opentime}'.format(opentime=opentime))
        else:
            print("No Best Buys with switches in stock!")

    else:
        print('Error getting the page!')


if __name__ == '__main__':
    main()
