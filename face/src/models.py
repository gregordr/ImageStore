from facenet_pytorch import MTCNN, InceptionResnetV1


class FaceRecognition:
    def __init__(self, min_face_size=20, device='cpu', max_face_num=15):
        self.max_face_num = max_face_num

        self._mtcnn = MTCNN(
            margin=0, min_face_size=min_face_size, keep_all=True,
            thresholds=[0.6, 0.7, 0.7], factor=0.709, post_process=True,
            device=device
        )

        self._resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

    def detect(self, image):
        boxes, _ = self._mtcnn.detect(image)
        return boxes[:self._max_face_num]

    def embed(self, image, boxes=None):
        if boxes is None:
            aligned = self._mtcnn(image)
        else:
            aligned = self._mtcnn.extract(image, boxes, None)

        return self._resnet(aligned).detach().cpu()
        
    def predict(self, image):
        boxes = self.detect(image)
        embedding = self.embed(image, boxes)
        return boxes, embedding
