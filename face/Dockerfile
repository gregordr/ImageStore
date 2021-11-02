FROM jjanzic/docker-python3-opencv
WORKDIR /code
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html 
RUN apt-get update
RUN apt-get install ffmpeg -y
COPY face.py .
CMD [ "python", "-u", "./face.py" ]