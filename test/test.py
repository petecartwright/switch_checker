import unittest
import sqlite3
import os

from switch_checker import switch_checker


class TestSwitchCheckerDatabase(unittest.TestCase):
    """ Test the database related functions
    """
    def setUp(self):
        print('setting up!')
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
