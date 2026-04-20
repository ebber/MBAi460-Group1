#!/bin/bash

#
# Pre-reqs:
#   1. requires python3
#   2. requires setup of AWSCLI (see project 01, part 01)
#   3. requires aws EB CLI
#         pip3 install awsebcli --upgrade --user
#

#
# Application variables:
#
APP_NAME="calc-web-service"
ENV_NAME="calc-web-service-env"
REGION="us-east-2"
PLATFORM="Node.js"

#
# start of script:
#
echo ""
echo "1. initializing EB"

eb init $APP_NAME \
        --platform $PLATFORM \
        --region $REGION 

#
# delete the application, which then deletes everything else:
#
echo ""
echo "2. deleting app"

rm -f *.zip &> /dev/null

eb terminate --all $APP_NAME
