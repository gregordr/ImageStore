import time
import io

from utils.image import rotate_exif
from api.gets import get_new_media, get_image
from classification.model import ImageClassifier


BASE_ADDRESS = 'http://localhost:4000'
MEDIA_ADDRESS = BASE_ADDRESS + '/media'
FETCH_INTERVAL = 5


if __name__ == "__main__":
    im_clf = ImageClassifier()
    while True:
        new_media_list = get_new_media(MEDIA_ADDRESS + '/new')
        for media in new_media_list:
            im = get_image(MEDIA_ADDRESS + '/' + media['id'])
            print(im_clf.predict(im))
            
        time.sleep(FETCH_INTERVAL)
    # im = Image.open(io.BytesIO(response.content))
    # im = rotate_exif(im)
    # im.show()
