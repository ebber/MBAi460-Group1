#
# Lambda function to analyze an image using AWS's Rekognition service.
#
# The image is passed to the function in the body of the request, in
# a dictionary-like object in JSON format:
#
#   {
#     "name": "imagefilename.jpg",
#     "bytes": "base64-encoded image bytes"
#   }
#
# The response is a dictionary-like object in JSON format, with
# status code of 200 (success) or 500 (server-side error). The data
# is 0 or more dictionary-like objects with 2 (key,value) pairs,
# the label (e.g. "Boat") and the confidence level (e.g. 97):
#
#   {
#     "message": "...",
#     "data":    [
#                  {"label": "...", "confidence": ...},
#                  ...
#                ]
#   }
#
import base64
import json

import boto3

from lambda_common import apigw_json

rekognition = boto3.client("rekognition")


def lambda_handler(event, context):
    try:
        print("**Call to analyze...")

        #
        # the user has sent us two parameters:
        #  1. name of their image file
        #  2. raw file data in base64 encoded string
        #
        # The parameters are coming in the body of the
        # request, in JSON format.
        #
        print("**Accessing request body")

        if "body" not in event:
            raise Exception("request has no body")

        body = json.loads(event["body"])

        if "name" not in body:
            raise Exception("request has no key 'name'")
        if "bytes" not in body:
            raise Exception("request has no key 'bytes'")

        filename = body["name"]
        image_b64 = body["bytes"]

        print("name:", filename)
        print("bytes (first 32 chars):", image_b64[0:32])

        image_bytes = base64.b64decode(image_b64)

        #
        # okay, let's call Rekognition to analyze the image:
        #
        print("**Calling Rekognition")

        response = rekognition.detect_labels(
            Image={"Bytes": image_bytes},
            MaxLabels=100,
            MinConfidence=80,
        )

        #
        # print out the response
        #
        print("**Rekognition response:")

        labels = response["Labels"]
        numlabels = len(labels)

        data = []

        print(f"# of labels: {numlabels}")

        for label in labels:
            label_name = label["Name"]
            confidence = int(label["Confidence"])
            print(f"{label_name} with {confidence}% confidence")

            data.append({"label": label_name, "confidence": confidence})

        print("**Responding to client...")

        return apigw_json(200, {"message": "success", "data": data})

    except Exception as e:
        print("**Exception")
        print("**Message:", str(e))

        body = {"message": str(e), "data": []}

        if str(e).startswith("request has no"):
            return apigw_json(400, body)

        return apigw_json(500, body)
