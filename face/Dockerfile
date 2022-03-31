FROM jjanzic/docker-python3-opencv
WORKDIR /code
COPY requirements.txt .
RUN pip install Cython
RUN pip install -r requirements.txt
RUN pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html
RUN gdown 18wEUfMNohBJ4K3Ly5wpTejPfDzp-8fI8 -O ~/.insightface/models/
RUN unzip ~/.insightface/models/antelopev2.zip -d ~/.insightface/models/
RUN apt-get update
RUN apt-get install ffmpeg -y
COPY face.py .
CMD [ "python", "-u", "./face.py" ]
