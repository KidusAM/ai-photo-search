import json
import boto3
import requests_aws4auth.requests as requests
from requests_aws4auth.requests_aws4auth import AWS4Auth
import random
import os

os_domain = os.environ['OpenSearchLink'] if 'OpenSearchLink' in os.environ else  'https://search-hw2-photos-kvfy2pafc5gbxpsezm4h6ft47e.us-east-1.es.amazonaws.com'

def get_matching_images(query):
    region = 'us-east-1'
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

    query_request = {
        "size" : 20,
        "query" : {
            "match" : {
                "labels" : query,
            }
        }
    }
    headers = { "Content-Type" : "application/json" }

    search_results = requests.post(os_domain + '/_search', auth=awsauth, headers=headers, data = json.dumps(query_request))

    return search_results

""" Returns (keyword1, keyword2). Will be None if not found."""
def get_keywords(search_text):
    client = boto3.client('lex-runtime')
    bot_response = client.post_text(
        botName = 'SearchImageTags',
        botAlias = 'latest',
        userId = 'search-photos-lambda',
        inputText= search_text
        )
    if 'slots' not in bot_response:
        return None
    keyword1, keyword2 = bot_response['slots']['KeywordOne'], bot_response['slots']['KeywordTwo']

    return keyword1,keyword2





def lambda_handler(event, context):
    def make_return(code, body):
        return {
            'statusCode' : code,
            'headers' : {
                "Content-Type" : "application/json",
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body' : body
                }

    error_response = {
        "code" : 400,
        "message" : "An error occurred"
    }
    success_response = {
        "results" : []
    }

    if 'queryStringParameters' not in event or not len(event['queryStringParameters'].get('q', "")):
        error_response['message'] = 'Query not specified. Use q parameter in URL.'
        return make_return(400, json.dumps(error_response))

    text = event['queryStringParameters']['q']
    keyword1, keyword2 = get_keywords(text)

    if not keyword1:
        error_response['message'] = 'Invalid search query, please try again'
        return make_return(400, json.dumps(error_response))

    query = keyword1
    if keyword2:
        query += ' ' + keyword2

    search_results = json.loads(get_matching_images(query).text)
    final_results = []
    for res in search_results['hits']['hits']:
        final_results.append({
            "url": 'https://' + res['_source']['bucket'] + '.s3.us-east-1.amazonaws.com/' + res['_source']['objectKey'],
            "labels" : res['_source']['labels']
            })
    success_response['results'] = final_results

    return make_return(200, json.dumps(success_response))
