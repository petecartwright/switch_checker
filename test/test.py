""" Testing for switch_checker
"""

import unittest
import datetime
import sqlite3
import os

from switch_checker import switch_checker


class TestSwitchCheckerDatabase(unittest.TestCase):
    """ Test the database related functions
    """
    def setUp(self):
        self.connection = sqlite3.connect('test.db')
        c = self.connection.cursor()
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
                                    )
                                 """
        c.execute(table_creation_string)
        
        self.connection.commit()
        
    def tearDown(self):
        self.connection.close()
        os.remove('test.db')
    
    def test_create_database_if_missing_existing_db(self):
        """ Should return False if the database exists """
        self.assertFalse(switch_checker.create_database_if_missing('test.db'))

    def test_create_database_if_missing_non_existing_db(self):
        """ Should return False if the database exists """
        self.assertTrue(switch_checker.create_database_if_missing('test2.db'))
        os.remove('test2.db')



class TestStoreDictProcessors(unittest.TestCase):
    """ Test the various functions that work with the store dicts that the API returns
    """
    # today = datetime.datetime.today().strftime('%Y-%m-%d')
    # store = {'products': [{'name':'fake product 1a'},
    #                       {'name':'fake product 1b'}
    #                      ],
    #          'name': 'Fake Store 1',
    #          'address': 'Fake Address 1',
    #          'city': 'Fake City 1',
    #          'region': 'Fake Region 1',
    #          'distance': 'Fake Distance 1',
    #          'postalCode': 'Fake Postal Code 1',
    #          'phone': 'Fake Phone 1',
    #          'detailedHours': [{today: 'fake opening time 1a'},
    #                            {'2017-01-01': 'fake opening time 1b'}
    #                           ]
    #         }

    def test_get_todays_opening_time(self):
        """ Testing a 'good' store dict with all expected values
        """
        today = datetime.datetime.today().strftime('%Y-%m-%d')
        store = {'detailedHours': [{'date': today, 'open': 'fake opening time 1a'},
                                   {'date': '2017-01-01', 'open': 'fake opening time 1b'}
                                  ]
                }
        opening_time = switch_checker.get_todays_opening_time(store)
        self.assertEquals(opening_time, 'fake opening time 1a')

    def test_get_todays_opening_time_without_today(self):
        """ Testing a store dict with no entry for today's hours
            Should return 00:00
        """
        
        store = {'detailedHours': [{'date': 'not today', 'open': 'fake opening time 1a'},
                                   {'date': '2017-01-01', 'open': 'fake opening time 1b'}
                                  ]
                }
        opening_time = switch_checker.get_todays_opening_time(store)
        self.assertEquals(opening_time, '00:00')
































