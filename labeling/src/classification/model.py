import numpy as np
from PIL import Image
import yaml
import tensorflow as tf

from keras.applications.imagenet_utils import decode_predictions, preprocess_input
from tensorflow.keras.applications import EfficientNetB0
from efficientnet.keras import center_crop_and_resize

class ImageClassifier:
    def __init__(self, rule_path):
        self._model = EfficientNetB0(weights='imagenet')
        with open(rule_path) as file:
            self._rules = yaml.full_load(file)


    def predict(self, image):
        try:
            image_size = self._model.input_shape[1]
            x = np.array(image)
            x = center_crop_and_resize(x, image_size=image_size)
            x = preprocess_input(x)
            x = np.expand_dims(x, 0)
            preds = self._model.predict(x)
            decoded = decode_predictions(preds, top=5)[0]
            return self._get_labels(decoded)
        except Exception as e:
            print(e)
            return []

    def _get_labels(self, predictions):
        labels = set()

        for pred in predictions:
            name = pred[1].replace('_', ' ').lower().strip()
            if name in self._rules:
                rule = self._rules[name]

                if 'see' in rule:
                    if rule['see'] != 'ignore':
                        labels.add(rule['see'])
                elif 'threshold' not in rule or pred[2] > rule ['threshold']:
                    if 'label' in rule:
                        labels.add(rule['label'])
                    else:
                        labels.add(name)
                    
                    if 'categories' in rule:
                        labels.update(rule['categories'])

        labels.update(self._get_all_categories(labels))
        return list(labels)


    def _get_all_categories(self, categories):
        output = set()

        for name in categories:
            if name in self._rules and 'categories' in self._rules[name]:
                output.update(self._rules[name]['categories'])
                output.update(self._get_all_categories(self._rules[name]['categories']))

        return output



