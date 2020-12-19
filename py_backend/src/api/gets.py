import json
import requests
import io
from PIL import Image
from requests.exceptions import ConnectionError


def get_new_media(url):
    try:
        response = requests.get(url)
    except ConnectionError as e:
        print(e, flush=True)
        return []

    if response.status_code == 200:
        try:
            return json.loads(response.content)
        except ValueError as e:
            # TODO: handle loading error here
            print(f'Error while parsing: \n{e}', flush=True)
            
    else:
        # TODO: handle connection error here
        print(f'Error while fetching new images f{url}: \n {response.status_code}', flush=True)

    return []


def get_image(url):
    try:
        response = requests.get(url)
    except ConnectionError as e:
        print(e, flush=True)
        return None

    if response.status_code == 200:
        try:
            return Image.open(io.BytesIO(response.content))
        except ValueError as e:
            # TODO: handle loading error here
            print(f'Error while parsing: \n{e}', flush=True)
            
    else:
        # TODO: handle connection error here
        print(f'Error while fetching image f{url}: \n {response.status_code}', flush=True)
    
    return None
