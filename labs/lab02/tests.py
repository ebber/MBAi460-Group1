#
# Unit tests for URL shortener service. To add more unit tests,
# add functions within the class below such that the function
# name starts with "test".
#
# To run:
#   python3 tests.py
#
# Initial template:
#   Prof. Joe Hummel
#   Northwestern University
#

import shorten
import unittest
import uuid


############################################################
#
# Unit tests
#
class URLShortenerTests(unittest.TestCase):
    #
    # NOTE: a unit test must start with "test" in order to be
    # discovered by Python's unit testing framework.
    #

    def setUp(self):
        shorten.put_reset()
        self.longurl = "https://" + str(uuid.uuid4()) + ".html"
        self.shorturl = "https://" + str(uuid.uuid4())

    def tearDown(self):
        shorten.put_reset()

    #
    # test #1: happy path — full lifecycle exercise of all 4 functions
    #
    def test_basic_api(self):
        print()
        print("** test_basic_api: basic test of API functions **")

        # short url not yet present:
        count = shorten.get_stats(self.shorturl)
        self.assertEqual(count, -1)

        # map long to short:
        success = shorten.put_shorturl(self.longurl, self.shorturl)
        self.assertEqual(success, True)

        # stats should be 0:
        count = shorten.get_stats(self.shorturl)
        self.assertEqual(count, 0)

        # now lookup short url:
        url = shorten.get_url(self.shorturl)
        self.assertEqual(url, self.longurl)

        # stats should now be 1:
        count = shorten.get_stats(self.shorturl)
        self.assertEqual(count, 1)

        # legal to re-register same long → short (idempotent):
        success = shorten.put_shorturl(self.longurl, self.shorturl)
        self.assertEqual(success, True)

        # empty the database:
        success = shorten.put_reset()
        self.assertEqual(success, True)

        # short url is now gone:
        count = shorten.get_stats(self.shorturl)
        self.assertEqual(count, -1)
        url = shorten.get_url(self.shorturl)
        self.assertEqual(url, "")

        print("test passed!")

    #
    # test #2: count tracks get_url calls exactly
    #
    def test_count_increment(self):
        print()
        print("** test_count_increment: count increments with each get_url call **")

        shorten.put_shorturl(self.longurl, self.shorturl)

        self.assertEqual(shorten.get_stats(self.shorturl), 0)
        shorten.get_url(self.shorturl)
        self.assertEqual(shorten.get_stats(self.shorturl), 1)
        shorten.get_url(self.shorturl)
        self.assertEqual(shorten.get_stats(self.shorturl), 2)
        shorten.get_url(self.shorturl)
        self.assertEqual(shorten.get_stats(self.shorturl), 3)

        print("test passed!")

    #
    # test #3: get_stats returns -1 for an unregistered short URL
    #
    def test_get_stats_not_found(self):
        print()
        print("** test_get_stats_not_found: get_stats returns -1 on miss **")

        count = shorten.get_stats(self.shorturl)
        self.assertEqual(count, -1)

        print("test passed!")

    #
    # test #4: get_url returns "" for an unregistered short URL
    #
    def test_get_url_not_found(self):
        print()
        print("** test_get_url_not_found: get_url returns '' on miss **")

        url = shorten.get_url(self.shorturl)
        self.assertEqual(url, "")

        print("test passed!")

    #
    # test #5: put_reset on an already-empty table returns True
    #
    def test_put_reset_empty(self):
        print()
        print("** test_put_reset_empty: put_reset on empty table succeeds **")

        # setUp already called put_reset — table is empty
        success = shorten.put_reset()
        self.assertEqual(success, True)

        print("test passed!")

    #
    # test #6: /Abc and /abc are treated as distinct short URLs (D6 — utf8mb4_bin)
    #
    def test_put_shorturl_case_sensitive(self):
        print()
        print("** test_put_shorturl_case_sensitive: short URLs are case-sensitive **")

        longurl_lower = "https://" + str(uuid.uuid4()) + ".html"
        longurl_upper = "https://" + str(uuid.uuid4()) + ".html"
        shorturl_lower = "/abc-" + str(uuid.uuid4())
        shorturl_upper = "/Abc-" + str(uuid.uuid4())[:3] + shorturl_lower[5:]

        # Register both — should succeed independently
        self.assertTrue(shorten.put_shorturl(longurl_lower, shorturl_lower))
        self.assertTrue(shorten.put_shorturl(longurl_upper, shorturl_upper))

        # Each resolves to its own longurl
        self.assertEqual(shorten.get_url(shorturl_lower), longurl_lower)
        self.assertEqual(shorten.get_url(shorturl_upper), longurl_upper)

        print("test passed!")

    #
    # test #7: put_shorturl returns False when short URL is taken by a different long URL
    #
    def test_put_shorturl_conflict(self):
        print()
        print("** test_put_shorturl_conflict: conflict returns False, DB unchanged **")

        different_longurl = "https://" + str(uuid.uuid4()) + ".html"

        # Register original mapping
        self.assertTrue(shorten.put_shorturl(self.longurl, self.shorturl))

        # Try to take the same short URL with a different long URL
        result = shorten.put_shorturl(different_longurl, self.shorturl)
        self.assertEqual(result, False)

        # Original mapping must be intact
        self.assertEqual(shorten.get_url(self.shorturl), self.longurl)

        print("test passed!")


############################################################
#
# main
#
if __name__ == '__main__':
    unittest.main()
