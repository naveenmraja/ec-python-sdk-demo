import config
import requests
import sys
from JuspayException import *


def check_param(kwargs, string):
    for key,value in kwargs.iteritems():
        if key.startswith(string):
            return True
    return False


def get_arg(kwargs, param):
    if kwargs is None:
        return None
    elif param in kwargs:
        return kwargs[param]
    else:
        return None


def request(method, url, parameters):
    try:
        if config.environment == 'production':
            server = 'https://api.juspay.in'
        elif config.environment == 'sandbox':
            server = 'https://sandbox.juspay.in'
        else:
            raise Exception("environment variable can only be 'production' or 'sandbox'")
        # Wrapper for requests
        if method.upper() == 'GET':
            response = requests.get(server + url, headers=config.version, params=parameters, auth=(config.api_key, ''))
        else:
            response = requests.post(server + url, headers=config.version, data=parameters, auth=(config.api_key, ''))

        # Report error if response is not 200 ("OK")
        if response.status_code >= 200 and response.status_code < 300:
            return response
        elif response.status_code in [400,404]:
            raise InvalidRequestException(json_body=response.content, http_status=response.status_code)
        elif response.status_code == 401:
            raise AuthenticationException(json_body=response.content, http_status=response.status_code)
        else:
            raise APIException(json_body=response.content or "", http_status=response.status_code)
    except IOError as err:
        raise APIConnectionException(message=str(err))


'''
class list_response:

    def __init__(self, count, offset, total, list):

        self.offset = offset
        self.count = count
        self.total = total
        self.list = list
'''
