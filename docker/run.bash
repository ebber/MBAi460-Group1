#!/bin/bash
#
# BASH script to run docker image in a docker container:
# Must be run from MBAi460-Group1/ repo root (uses ./docker/ relative path).
# Prefer utils/docker-run for a path-safe alternative.
#
read -r image < ./docker/_image-name.txt
#
# Some notes:
#  -it  => iteractive
#  -u   => run as this user 
#  -w   => home dir
#  -v   => map current dir (.) TO home dir
#  --rm => remove container when done
#
docker run -it -u user -w /home/user -v .:/home/user --network host --rm "$image" bash
