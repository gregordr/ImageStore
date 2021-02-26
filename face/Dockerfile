FROM jjanzic/docker-python3-opencv:opencv-4.0.0
WORKDIR /code
COPY requirements.txt .
RUN pip install -r requirements.txt 
COPY src/ .
CMD [ "python", "./app.py" ]