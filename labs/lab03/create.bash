#!/bin/bash

#
# Pre-reqs:
#   1. requires zip command-line utility
#   2. requires python3
#   3. requires setup of AWSCLI (see project 01, part 01)
#   4. requires aws EB CLI
#         pip3 install awsebcli --upgrade --user
#

#
# Application variables:
#
APP_NAME="calc-web-service"
ENV_NAME="calc-web-service-env"
REGION="us-east-2"
PLATFORM="Node.js"
HARDWARE="t3.micro"
ZIPFILE="app.zip"

#
# Network-related variables:
#
VPCID="vpc-???"
VPCSUBGROUPS="subnet-???,subnet-???,subnet-???"

#
# start of script:
#
echo ""
echo "1. initializing EB"

eb init $APP_NAME \
        --platform $PLATFORM \
        --region $REGION 

#
# drop down into ./app sub-dir and zip the contents:
#
echo ""
echo "2. packaging app"
rm -f *.zip &> /dev/null
pushd ./app &> /dev/null
rm -f *.zip &> /dev/null
zip $ZIPFILE *
mv $ZIPFILE .. &> /dev/null
popd &> /dev/null

#
# now create a new web service and deploy the .zip:
#
# NOTE: we create with AWS sample app, then update with
# our app. Strange, but it's the simplest way to work 
# with .zip files of our code.
#
echo ""
echo "3. Creating environment on EB..."

eb create $ENV_NAME \
          --instance_type $HARDWARE \
          --platform $PLATFORM \
          --vpc.id $VPCID \
          --vpc.ec2subnets $VPCSUBGROUPS \
          --single \
          --sample

echo ""
echo "4. Deploying app to EB..."

eb deploy $ENV_NAME \
         --archive $ZIPFILE \
         --region $REGION

echo ""
echo "Done! You can use 'eb status' to check status of web service."
echo ""
