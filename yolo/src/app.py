import time
import os
import argparse

from misc.image import rotate_exif
from misc.gets import get_new_media, get_image
from misc.posts import post_image_labels
from classification.model import ImageClassifier
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()
    backend_address = "http://" + os.getenv("BASE_ADDRESS", 'localhost:4000')

    parser = argparse.ArgumentParser()

    # SERVER
    parser.add_argument('--fetch_interval', type=float, default=os.getenv("FETCH_INTERVAL", '5'), help='time interval between GET operations')

    # YOLO V5
    parser.add_argument('--weights', nargs='+', type=str, default='yolov5s.pt', help='model.pt path(s)')
    parser.add_argument('--img_size', type=int, default=640, help='inference size (pixels)')
    parser.add_argument('--conf_thres', type=float, default=0.25, help='object confidence threshold')
    parser.add_argument('--iou_thres', type=float, default=0.45, help='IOU threshold for NMS')
    parser.add_argument('--device', default='cpu', help='cuda device, i.e. 0 or 0,1,2,3 or cpu')
    parser.add_argument('--classes', nargs='+', type=int, help='filter by class: --class 0, or --class 0 2 3')
    parser.add_argument('--agnostic-nms', action='store_true', help='class-agnostic NMS')
    parser.add_argument('--augment', action='store_true', help='augmented inference')
    args = parser.parse_args()

    im_clf = ImageClassifier(args)
    
    while True:
        time.sleep(args.fetch_interval)
        new_media_list = get_new_media(backend_address + '/labels/getBatch')
        for media in new_media_list:
            prediction = []

            try:
                im = get_image(backend_address + '/media/thumb_' + media['id'])
                im = rotate_exif(im)
                prediction = im_clf.predict(im)
            except Exception as e:
                print(e, flush=True)

            post_image_labels(backend_address + '/labels/labelAuto', media['id'], prediction)
            
