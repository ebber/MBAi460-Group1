#
# Simple client-side testing code for photoapp API functions.
#
# Initial code:
#   Prof. Joe Hummel
#   Northwestern University
#

import photoapp
import sys

#
# eliminate traceback so we just get error message:
#
sys.tracebacklimit = 0

print()
print("**starting**")
print()

print("**initialize**")
success = photoapp.initialize('photoapp-config.ini', 's3readwrite', 'photoapp-read-write')
print(success)

print()

print("**get_ping**")
(M,N) = photoapp.get_ping()
print()
print(f"M: {M}")
print(f"N: {N}")

print()
print("**done**")
print()
