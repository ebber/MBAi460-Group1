#
# Unit tests for photoapp API functions
#
# Initial tests:
#   Prof. Joe Hummel
#   Northwestern University
#

import photoapp
import unittest
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

  @classmethod
  def setUpClass(cls):
    if not os.path.exists('photoapp-config.ini'):
      raise unittest.SkipTest(
        "photoapp-config.ini not found — copy from Part 01 and populate "
        "[s3readonly] and [s3readwrite] sections with IAM access keys"
      )
    photoapp.initialize('photoapp-config.ini', 's3readwrite', 'photoapp-read-write')

  def setUp(self):
    if hasattr(photoapp, 'delete_images'):
      try:
        photoapp.delete_images()
      except Exception:
        pass

  def test_01(self):
    print()
    print("** test_01: initialize **")

    success = photoapp.initialize('photoapp-config.ini', 's3readwrite', 'photoapp-read-write')
    self.assertEqual(success, True)

    print("test passed!")

  def test_02(self):
    print()
    print("** test_02: get_ping **")

    (M, N) = photoapp.get_ping()

    self.assertIsInstance(M, int, f"S3 not reachable: {M}")
    self.assertEqual(N, 3)

    print("test passed!")

  def test_03(self):
    print()
    print("** test_03: get_users **")

    try:
      users = photoapp.get_users()
    except AttributeError:
      self.fail("get_users() not yet implemented in photoapp.py")

    correct = [(80001, 'p_sarkar', 'Pooja', 'Sarkar'),
               (80002, 'e_ricci', 'Emanuele', 'Ricci'),
               (80003, 'l_chen', 'Li', 'Chen')]

    self.assertEqual(users, correct)

    print("test passed!")


  def test_04(self):
    print()
    print("** test_04: get_images **")

    try:
      images = photoapp.get_images()
    except AttributeError:
      self.fail("get_images() not yet implemented in photoapp.py")

    self.assertIsInstance(images, list)
    for row in images:
      self.assertEqual(len(row), 4)
      assetid, userid, localname, bucketkey = row
      self.assertIsInstance(assetid, int)
      self.assertIsInstance(userid, int)

    result = photoapp.get_images(userid=99999)
    self.assertEqual(result, [])

    print("test passed!")


  def test_05(self):
    print()
    print("** test_05: post_image **")

    try:
      photoapp.post_image(99999, "01degu.jpg")
      self.fail("Expected ValueError for invalid userid")
    except AttributeError:
      self.fail("post_image() not yet implemented")
    except ValueError as e:
      self.assertEqual(str(e), "no such userid")

    assetid = photoapp.post_image(80001, "01degu.jpg")
    self.assertIsInstance(assetid, int)
    self.assertGreater(assetid, 0)

    images = photoapp.get_images(userid=80001)
    self.assertEqual(len(images), 1)
    self.assertEqual(images[0][0], assetid)

    print("test passed!")


  def test_06(self):
    print()
    print("** test_06: get_image **")

    assetid = photoapp.post_image(80001, "01degu.jpg")

    try:
      photoapp.get_image(99999)
      self.fail("Expected ValueError for invalid assetid")
    except AttributeError:
      self.fail("get_image() not yet implemented")
    except ValueError as e:
      self.assertEqual(str(e), "no such assetid")

    filename = photoapp.get_image(assetid)
    self.assertIsInstance(filename, str)
    self.assertTrue(os.path.exists(filename))

    overwrite_path = "overwrite_test_tmp.jpg"
    with open(overwrite_path, 'wb') as f:
      f.write(b"placeholder")
    placeholder_size = os.path.getsize(overwrite_path)

    returned = photoapp.get_image(assetid, overwrite_path)
    self.assertEqual(returned, overwrite_path)
    self.assertTrue(os.path.exists(overwrite_path))
    self.assertGreater(os.path.getsize(overwrite_path), placeholder_size)

    os.remove(overwrite_path)

    print("test passed!")


  def test_07(self):
    print()
    print("** test_07: delete_images **")

    photoapp.post_image(80001, "01degu.jpg")
    photoapp.post_image(80002, "02earth.jpg")

    images_before = photoapp.get_images()
    self.assertGreater(len(images_before), 0)

    try:
      result = photoapp.delete_images()
    except AttributeError:
      self.fail("delete_images() not yet implemented")

    self.assertEqual(result, True)

    images_after = photoapp.get_images()
    self.assertEqual(len(images_after), 0)

    print("test passed!")


  def test_08(self):
    print()
    print("** test_08: post_image with rekognition **")

    assetid = photoapp.post_image(80001, "01degu.jpg")

    try:
      labels = photoapp.get_image_labels(assetid)
    except AttributeError:
      self.fail("get_image_labels() not yet implemented")

    self.assertIsInstance(labels, list)
    self.assertGreater(len(labels), 0)

    label, confidence = labels[0]
    self.assertIsInstance(label, str)
    self.assertIsInstance(confidence, int)

    print("test passed!")


  def test_09(self):
    print()
    print("** test_09: get_image_labels **")

    assetid = photoapp.post_image(80001, "01degu.jpg")

    try:
      photoapp.get_image_labels(99999)
      self.fail("Expected ValueError for invalid assetid")
    except AttributeError:
      self.fail("get_image_labels() not yet implemented")
    except ValueError as e:
      self.assertEqual(str(e), "no such assetid")

    labels = photoapp.get_image_labels(assetid)
    self.assertIsInstance(labels, list)
    for row in labels:
      label, confidence = row
      self.assertIsInstance(label, str)
      self.assertIsInstance(confidence, int)

    print("test passed!")


  def test_10(self):
    print()
    print("** test_10: get_images_with_label **")

    assetid1 = photoapp.post_image(80001, "01degu.jpg")
    assetid2 = photoapp.post_image(80002, "02earth.jpg")

    result = photoapp.get_images_with_label("zzznomatchzzz")
    self.assertEqual(result, [])

    try:
      results = photoapp.get_images_with_label("a")
    except AttributeError:
      self.fail("get_images_with_label() not yet implemented")

    for row in results:
      self.assertEqual(len(row), 3)
      assetid, label, confidence = row
      self.assertIsInstance(assetid, int)
      self.assertIsInstance(label, str)
      self.assertIsInstance(confidence, int)
      self.assertIn("a", label.lower())

    self.assertGreater(len(results), 1, "Expected multiple results for 'a' search across 2 images")
    for i in range(len(results) - 1):
      curr_assetid, curr_label, _ = results[i]
      next_assetid, next_label, _ = results[i + 1]
      self.assertLessEqual(
        curr_assetid, next_assetid,
        f"assetid not sorted ASC at index {i}: {curr_assetid} > {next_assetid}"
      )
      if curr_assetid == next_assetid:
        self.assertLessEqual(
          curr_label, next_label,
          f"label not sorted ASC within assetid {curr_assetid} at index {i}: '{curr_label}' > '{next_label}'"
        )

    print("test passed!")


############################################################
#
# main
#
if __name__ == '__main__':
  unittest.main()
