import numpy as np
from PIL import Image
import sys
from os import error
import time
import torch

sys.path.append("yolov5")

from models.experimental import attempt_load
from utils.datasets import LoadStreams, LoadImages, letterbox
from utils.general import check_img_size, non_max_suppression, apply_classifier, scale_coords, xyxy2xywh, \
    strip_optimizer, set_logging, increment_path
from utils.torch_utils import select_device, load_classifier


class ImageClassifier:
    def __init__(self, args):
        self._args = args
        self._device = select_device(args.device)
        self._half = self._device.type != 'cpu'
        self._model = attempt_load(args.weights, map_location=self._device)  # load FP32 model
        self._names = self._model.module.names if hasattr(self._model, 'module') else self._model.names
        self._img_size = check_img_size(args.img_size, s=self._model.stride.max())
        if self._half:
            self._model.half()  # to FP16

    def predict(self, image):
        img = np.array(image)[:, :, :3].copy()

        # padded resize
        img = letterbox(img, new_shape=self._img_size)[0]

        # convert
        img = img.transpose(2, 0, 1)  # to 3xWxH
        img = np.ascontiguousarray(img)
        img = torch.from_numpy(img).to(self._device)

        img = img.half() if self._half else img.float()  # uint8 to fp16/32
        img /= 255.0  # 0 - 255 to 0.0 - 1.0
        if img.ndimension() == 3:
            img = img.unsqueeze(0)

        # Inference
        pred = self._model(img, augment=self._args.augment)[0]

        # Apply NMS
        pred = non_max_suppression(pred, self._args.conf_thres, self._args.iou_thres, classes=self._args.classes, agnostic=self._args.agnostic_nms)

        det = pred[0]

        outputs = []
        for c in det[:, -1].unique():
            outputs.append(self._names[int(c)])

        return outputs
