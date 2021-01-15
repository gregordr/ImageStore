import json
from os import error
import requests
import io
from PIL import Image
from requests.exceptions import ConnectionError


def get(url):
    try:
        response = requests.get(url)
    except ConnectionError as e:
        # TODO: handle connection error here
        print(e, flush=True)
        return None

    if response.status_code == 200:
        return response
    else:
        # TODO: handle connection error here
        print(f'Error while fetching new images {url}: \n {response.status_code}', flush=True)

    return None


def get_new_media(url):
    response = get(url)

    if response is None:
        return []

    try:
        return json.loads(response.content)
    except error as e:
        # TODO: handle loading error here
        print(f'Error while parsing: \n{e}', flush=True)

def get_image(url):
    response = get(url)

    if response is None:
        return None
    
    try:
        return Image.open(io.BytesIO(response.content))
    except ValueError as e:
        # TODO: handle loading error here
        print(f'Error while parsing: \n{e}', flush=True)
