import time
import io
import requests
from PIL import Image

from utils.image import rotate_exif


if __name__ == "__main__":
    response = requests.get('http://localhost:4000/media/16420')
    im = Image.open(io.BytesIO(response.content))
    im = rotate_exif(im)
    im.show()
