import json
import requests
import io
from PIL import Image


def post_image_labels(url, img_id, labels):
    data = {
        'id': img_id,
        'labels[]': labels
    }
    # TODO: handle error here
    requests.post(url, json=data)
    