""" Testing for switch_checker
"""

import unittest
import datetime
import sqlite3
import os

from switch_checker import switch_checker

# we use today as a formatted string all over 
# defining it here in case we want to change
# formatting later
TODAY = datetime.datetime.today().strftime('%Y-%m-%d')

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

    def test_add_one_store_to_database(self):
        """ make sure we can add a record to the database and get it back 
        """
        
        store = {'products': [{'name':'fake product 1a'},
                              {'name':'fake product 1b'}
                             ],
                 'name': 'Fake Store 1',
                 'address': 'Fake Address 1',
                 'city': 'Fake City 1',
                 'region': 'Fake Region 1',
                 'distance': 'Fake Distance 1',
                 'postalCode': 'Fake Postal Code 1',
                 'phone': 'Fake Phone 1',
                 'detailedHours': [{'date': TODAY, 'open': 'fake opening time 1a'},
                                   {'date': '2017-01-01', 'open': 'fake opening time 1b'}
                                  ]
                }

        self.assertTrue(switch_checker.add_one_store_to_database('test.db', store))

        # make sure we can get it out
        c = self.connection.cursor()
        results = c.execute('select * from stores;')
        records = results.fetchall()
        # put the results into an easier-to-work with dict
        store_list = [dict((results.description[i][0], value) for i, value in enumerate(row)) for row in records]
        self.assertEquals(len(store_list), 2)
        self.assertEquals(store_list[0]['date_checked'], TODAY)
        self.assertEquals(store_list[0]['model_name'], 'fake product 1a')
        self.assertEquals(store_list[0]['store_name'], 'Fake Store 1')
        self.assertEquals(store_list[0]['address'], 'Fake Address 1')
        self.assertEquals(store_list[0]['city'], 'Fake City 1')
        self.assertEquals(store_list[0]['search_zip'], 'Fake Postal Code 1')
        self.assertEquals(store_list[0]['region'], 'Fake Region 1')
        self.assertEquals(store_list[0]['open_at'], 'fake opening time 1a')
        self.assertEquals(store_list[0]['phone_number'], 'Fake Phone 1')


    def test_add_all_stores_to_database(self):
        """ Add a couple stores to the database, make sure we get them back
        """
        store1 = {'products': [{'name':'fake product 1a'}
                              ],
                  'name': 'Fake Store 1',
                  'address': 'Fake Address 1',
                  'city': 'Fake City 1',
                  'region': 'Fake Region 1',
                  'distance': 'Fake Distance 1',
                  'postalCode': 'Fake Postal Code 1',
                  'phone': 'Fake Phone 1',
                  'detailedHours': [{'date': '2017-01-01', 'open': 'fake opening time 1b'}
                                   ]
                 }

        store2 = {'products': [{'name':'fake product 2b'}
                              ],
                  'name': 'Fake Store 2',
                  'address': 'Fake Address 2',
                  'city': 'Fake City 2',
                  'region': 'Fake Region 2',
                  'distance': 'Fake Distance 2',
                  'postalCode': 'Fake Postal Code 2',
                  'phone': 'Fake Phone 2',
                  'detailedHours': [{'date': '2017-01-01', 'open': 'fake opening time 2b'}
                                   ]
                 }
        all_stores = [store1, store2]
        switch_checker.add_all_stores_to_database(db_name='test.db', stores=all_stores)

        # make sure we can get it out
        c = self.connection.cursor()
        results = c.execute('select * from stores;')
        # put the results into an easier-to-work with dict
        store_list = [dict((results.description[i][0], value) for i, value in enumerate(row)) for row in results.fetchall()]
        self.assertEquals(len(store_list), 2)


    def test_add_all_stores_to_database_with_existing_data(self):
        """ Add one record into the table with today's date. 
            Any further records shouldn't be added today
        """
        c = self.connection.cursor()
        c.execute("""INSERT INTO stores (date_checked, store_name) 
                     VALUES({today}, 'Fake Store 1');""".format(today=TODAY))
        self.connection.commit()
        results = c.execute('select * from stores;')
        # put the results into an easier-to-work with dict
        store_list = [dict((results.description[i][0], value) for i, value in enumerate(row)) for row in results.fetchall()]
        self.assertEqual(len(store_list), 1)



class TestStoreDictProcessors(unittest.TestCase):
    """ Test the various functions that work with the store dicts that the API returns
    """

    def test_get_todays_opening_time(self):
        """ Testing a 'good' store dict with all expected values
        """
        store = {'detailedHours': [{'date': TODAY, 'open': 'fake opening time 1a'},
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
































