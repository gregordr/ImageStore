import numpy as np
from PIL import Image
import sys
import os
import torch

import detectron2.utils.comm as comm
from detectron2.checkpoint import DetectionCheckpointer
from detectron2.data import build_detection_test_loader, build_detection_train_loader
from detectron2.config import get_cfg
from detectron2.engine import DefaultTrainer, default_setup, launch
from detectron2.evaluation import COCOEvaluator, verify_results

sys.path.append("bottom-up-attention.pytorch")

from models.bua import add_bottom_up_attention_config
from models.bua.box_regression import BUABoxes
from utils.extract_utils import get_image_blob
from models.bua.layers.nms import nms


class ImageClassifier:
    def __init__(self, min_boxes=3, max_boxes=10, threshold=0.5):
        config_file = 'bottom-up-attention.pytorch/configs/bua-caffe/extract-bua-caffe-r101.yaml'
        self._cfg = get_cfg()
        add_bottom_up_attention_config(self._cfg, True)
        self._cfg.merge_from_file(config_file)
        self._cfg.MODEL.DEVICE = 'cpu'

        self._model = DefaultTrainer.build_model(self._cfg)
        DetectionCheckpointer(self._model, save_dir=self._cfg.OUTPUT_DIR).resume_or_load(self._cfg.MODEL.WEIGHTS)
        self._model.eval()

        self._min_boxes = min_boxes
        self._max_boxes = max_boxes
        self._threshold = threshold

        self._classes = ['__background__']
        with open(os.path.join('bottom-up-attention.pytorch', 'evaluation', 'objects_vocab.txt')) as f:
            for object in f.readlines():
                self._classes.append(object.split(',')[0].lower().strip())

    def predict(self, image):
        # convert image to opencv format
        x = np.array(image)
        x = x[:, :, ::-1].copy() 

        dataset_dict = get_image_blob(x, self._cfg.MODEL.PIXEL_MEAN)

        with torch.set_grad_enabled(False):
            boxes, scores, features_pooled, attr_scores = self._model([dataset_dict])

        dets = boxes[0].tensor.cpu() / dataset_dict['im_scale']
        scores = scores[0].cpu()
        feats = features_pooled[0].cpu()
        attr_scores = attr_scores[0].cpu()

        max_conf = torch.zeros((scores.shape[0])).to(scores.device)
        for cls_ind in range(1, scores.shape[1]):
            cls_scores = scores[:, cls_ind]
            keep = nms(dets, cls_scores, 0.3)
            max_conf[keep] = torch.where(cls_scores[keep] > max_conf[keep], cls_scores[keep], max_conf[keep])
                    
        keep_boxes = torch.nonzero(max_conf >= self._threshold).flatten()
        if len(keep_boxes) < self._min_boxes:
            keep_boxes = torch.argsort(max_conf, descending=True)[:self._min_boxes]
        elif len(keep_boxes) > self._max_boxes:
            keep_boxes = torch.argsort(max_conf, descending=True)[:self._max_boxes]

        boxes = dets[keep_boxes].numpy()
        objects = np.argmax(scores[keep_boxes].numpy()[:,1:], axis=1)
        attr = np.argmax(attr_scores[keep_boxes].numpy()[:,1:], axis=1)
        attr_conf = np.max(attr_scores[keep_boxes].numpy()[:,1:], axis=1)

        outputs = []
        for i in range(len(keep_boxes)):
            # if attr_conf[i] > attr_thresh:
            #     cls = attributes[attr[i]+1] + " " + cls
            outputs.append(self._classes[objects[i]+1])

        return outputs
