import json
import boto3
import time
from requests_aws4auth.requests_aws4auth import AWS4Auth
import requests
import os

os_domain = os.environ['OpenSearchLink'] if 'OpenSearchLink' in os.environ else  'https://search-hw2-photos-kvfy2pafc5gbxpsezm4h6ft47e.us-east-1.es.amazonaws.com'

def lambda_handler(event, context):
    s3_data = event['Records'][0]['s3']
    bucket_name, image_file = s3_data['bucket']['name'], s3_data['object']['key']
    image_object = {
        "S3Object": {
            "Bucket" : bucket_name,
            "Name" : image_file
        }
    }

    rekognition = boto3.client('rekognition')
    s3 = boto3.client('s3')

    s3_metadata = s3.head_object(Bucket=bucket_name, Key=image_file)

    photo_labels = []
    try:
        if 'customlabels' in s3_metadata['Metadata']:
            print('the metadata is: ', s3_metadata['Metadata']['customlabels'])
            photo_labels = json.loads(s3_metadata['Metadata']['customlabels'])['customlabels']
    except Exception as e:
        print("error parsing custom labels: ", e)


    labels_response = rekognition.detect_labels(Image=image_object)
    amazon_labels = [label['Name'] for label in labels_response['Labels']]

    photo_labels.extend(amazon_labels)
    print("Labels for ", image_file, " are ", photo_labels)

    index_item = {
        'objectKey' : image_file,
        'bucket' : bucket_name,
        'createdTimestamp' : time.time(),
        'labels' : photo_labels
    }


    region = 'us-east-1'
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

    host = os_domain
    index = 'photos'
    index_type = '_doc'
    url = host + '/' + index + '/' + index_type
    headers = { "Content-Type" : "application/json" }

    index_id = index_item['objectKey']

    response = requests.post(url, auth=awsauth, json=index_item)

    return response

