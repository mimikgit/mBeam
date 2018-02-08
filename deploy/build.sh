cp ../build/index.js ./
sudo docker build -t beam-v1 .
sudo docker save -o beam-v1.tar beam-v1
sudo chmod 666 beam-v1.tar
sudo docker rmi beam-v1

