import json
import requests
import io
from PIL import Image


def get_new_media(url):
    response = requests.get(url)
    if response.status_code == 200:
        try:
            return json.loads(response.content)
        except ValueError as e:
            # TODO: handle loading error here
            print(f'Error while parsing: \n{e}')
            
    else:
        # TODO: handle connection error here
        print(f'Error while fetching new images f{url}: \n {response.status_code}')

    return []


def get_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        try:
            return Image.open(io.BytesIO(response.content))
        except ValueError as e:
            # TODO: handle loading error here
            print(f'Error while parsing: \n{e}')
            
    else:
        # TODO: handle connection error here
        print(f'Error while fetching image f{url}: \n {response.status_code}')
    
    return None
