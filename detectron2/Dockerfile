FROM jjanzic/docker-python3-opencv
WORKDIR /code
RUN apt-get update
RUN apt-get install libgl1-mesa-glx -y
COPY requirements.txt .
RUN apt-get update \
    && apt-get install -y libsm6 libxext6 libxrender-dev \
    && wget https://awma1-my.sharepoint.com/:u:/g/personal/yuz_l0_tn/EaXvCC3WjtlLvvEfLr3oa8UBLA21tcLh4L8YLbYXl6jgjg?download=1 -O 'bua-caffe-frcn-r101_with_attributes.pth' \
    && pip install -r requirements.txt \
    && pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html \
    && git clone https://github.com/NVIDIA/apex.git \
    && cd apex \
    && git checkout a0d99fdb2cfcc418809dde975f51097c3d6010ca \
    && python setup.py install \
    && cd .. \
    && git clone --recursive https://github.com/MILVLG/bottom-up-attention.pytorch \
    && cd bottom-up-attention.pytorch/detectron2 \
    && pip install -e . \
    && cd .. \
    && python setup.py build develop
COPY src/ .
CMD [ "python", "./app.py" ]
