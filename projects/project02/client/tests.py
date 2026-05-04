#
# Unit tests for photoapp API functions
#
# Initial tests:
#   Prof. Joe Hummel
#   Northwestern University
#

import photoapp
import unittest
import sys
import logging
import os


############################################################
#
# Unit tests
#
class PhotoappTests(unittest.TestCase):
    #
    # NOTE: a unit test must start with "test" in order to be
    # discovered by Python's unit testing framework.
    #

  def test_01(self):
    print()
    print("** test_01: initialize **")

    success = photoapp.initialize('photoapp-client-config.ini')
    self.assertEqual(success, True)

    print("test passed!")

  def test_02(self):
    print()
    print("** test_02: get_ping **")

    (M, N) = photoapp.get_ping()

    self.assertEqual(M, 0)
    self.assertEqual(N, 3)

    print("test passed!")

  def test_03(self):
    print()
    print("** test_03: get_users **")

    correct = [(80001, 'p_sarkar', 'Pooja', 'Sarkar'),
               (80002, 'e_ricci', 'Emanuele', 'Ricci'),
               (80003, 'l_chen', 'Li', 'Chen')]

    users = photoapp.get_users()

    self.assertEqual(users, correct)

    print("test passed!")

  def test_04_get_images_empty_smoke(self):
    """Read-only smoke: get_images() returns a list."""
    print()
    print("** test_04: get_images smoke **")
    images = photoapp.get_images()
    self.assertIsInstance(images, list)
    print(f"got {len(images)} image(s)")
    print("test passed!")

  def test_05_search_smoke(self):
    """Read-only smoke: get_images_with_label() returns a list."""
    print()
    print("** test_05: get_images_with_label smoke **")
    results = photoapp.get_images_with_label('a')
    self.assertIsInstance(results, list)
    print(f"got {len(results)} match(es) for 'a'")
    print("test passed!")

  def test_99_lifecycle_destructive(self):
    """
    DESTRUCTIVE: clears DB + S3 via delete_images, then exercises
    post_image, get_image, get_image_labels, get_images_with_label,
    and delete_images end-to-end. Numbered 99 so it runs last under
    unittest's alphabetical ordering. Skip with `-k 'not test_99'`
    if you don't want the DB wiped.
    """
    print()
    print("** test_99: full lifecycle (DESTRUCTIVE) **")

    # ensure clean baseline
    photoapp.delete_images()

    initial = photoapp.get_images()
    self.assertEqual(initial, [])

    # post a sample image (file shipped in projects/project02/client/)
    sample = '00no-labels.jpg'
    assetid = photoapp.post_image(80001, sample)
    print(f"posted {sample} -> assetid {assetid}")
    self.assertIsInstance(assetid, int)
    self.assertGreaterEqual(assetid, 1001)

    # listing now has one image
    after_post = photoapp.get_images()
    self.assertEqual(len(after_post), 1)
    self.assertEqual(after_post[0][1], 80001)  # userid

    # download by assetid
    out = '_test99_download.bin'
    saved = photoapp.get_image(assetid, out)
    self.assertEqual(saved, out)
    self.assertTrue(os.path.exists(out))
    os.remove(out)
    print("download round-trip verified")

    # labels (00no-labels.jpg has no labels by design)
    labels = photoapp.get_image_labels(assetid)
    self.assertIsInstance(labels, list)
    print(f"labels for assetid {assetid}: {labels}")

    # search smoke
    results = photoapp.get_images_with_label('a')
    self.assertIsInstance(results, list)

    # cleanup
    ok = photoapp.delete_images()
    self.assertTrue(ok)
    final = photoapp.get_images()
    self.assertEqual(final, [])

    print("test passed!")


############################################################
#
# main
#

#
# eliminate traceback so we just get error message:
#
sys.tracebacklimit = 0

#
# capture logging output in file 'log.txt'
#
logging.basicConfig(
  filename='log.txt',
  level=logging.INFO,
  format='%(asctime)s - %(levelname)s - %(message)s',
  filemode='w'
)

if __name__ == '__main__':
  unittest.main()
