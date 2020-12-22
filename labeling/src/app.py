import time
import os

from utils.image import rotate_exif
from api.gets import get_new_media, get_image
from api.posts import post_image_labels
from classification.model import ImageClassifier
from dotenv import load_dotenv

load_dotenv()

BASE_ADDRESS = "http://" + os.getenv("BASE_ADDRESS", 'localhost:4000')
MEDIA_ADDRESS = BASE_ADDRESS + '/media'
LABEL_ADDRESS = BASE_ADDRESS + '/labels'
FETCH_INTERVAL = int(os.getenv("FETCH_INTERVAL", '5'))
RULE_PATH = 'data/rules.yml'


if __name__ == "__main__":
    im_clf = ImageClassifier(RULE_PATH)
    time.sleep(FETCH_INTERVAL)
    
    while True:
        new_media_list = get_new_media(LABEL_ADDRESS + '/getBatch')
        for media in new_media_list:
            im = get_image(MEDIA_ADDRESS + '/' + media['id'])
            im = rotate_exif(im)
            prediction = im_clf.predict(im)
            post_image_labels(LABEL_ADDRESS + '/labelAuto', media['id'], prediction)
            
        time.sleep(FETCH_INTERVAL)
