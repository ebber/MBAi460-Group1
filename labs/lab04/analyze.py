#
# Lambda function to analyze an image using AWS's Rekognition service.
#
# The image is passed to the function in the body of the request, in
# a dictionary-like object in JSON format:
#
#   { 
#     "name": "imagefilename.jpg",
#      "bytes": "base64-encoded image bytes"
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
#
import json
import boto3
import base64

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
      
    body = json.loads(event["body"]) # parse the json
    
    if "name" not in body:
      raise Exception("request has no key 'name'")
    if "bytes" not in body:
      raise Exception("request has no key 'bytes'")

    name = body["name"]
    bytes = body["bytes"]
    
    print("name:", name)
    print("bytes (first 32 chars):", bytes[0:32])

    #name  = 'gray.jpg'
    #bytes = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

    orig_bytes = base64.b64decode(bytes)

    #
    # okay, let's call Rekognition to analyze the image:
    #
    print("**Calling Rekognition")

    rekognition = boto3.client('rekognition')

    response = rekognition.detect_labels(
          Image={
            'Bytes': orig_bytes,
          },
          MaxLabels=100,
          MinConfidence=80,
    )

    #
    # print out the response
    #
    print("**Rekognition response:")

    labels = response['Labels']
    numlabels = len(labels)

    data = []

    print(f"# of labels: {numlabels}")

    for label in labels:
      name = label['Name']
      confidence = int(label['Confidence'])
      print(f"{name} with {confidence}% confidence")

      data.append({
        'label': name,
        'confidence': confidence
      })
      
    print("**Responding to client...")

    body = {
      "message": "success",
      "data": data
    }

    return {
        'statusCode': 200,
        'body': json.dumps(body)
    }

  #
  # exception handling:
  #
  except Exception as e:
    print("**Exception")
    print("**Message:", str(e))

    body = {
      "message": str(e),
      "data": []
    }

    if str(e).startswith("request has no"):
      #
      # client error as we were not called correctly:
      #
      return {
        'statusCode': 400,
        'body': json.dumps(body)
      }
    else:
      #
      # server-side error:
      #
      return {
        'statusCode': 500,
        'body': json.dumps(body)
      }
