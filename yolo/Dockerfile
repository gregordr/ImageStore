FROM jjanzic/docker-python3-opencv
WORKDIR /code
RUN apt-get update
RUN apt-get install libgl1-mesa-glx -y
COPY requirements.txt .
RUN pip install -r requirements.txt  \
    && pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html \
    && git clone https://github.com/ultralytics/yolov5.git \
    && cd yolo5 \
    && git checkout 79bca2bf64da04e7e1e74a132eb54171f41638cc \
    && cd ..
COPY src/ .
CMD [ "python", "./app.py" ]
