#!/bin/bash
docker stop test-pcert
docker rm test-pcert
docker rmi test-pcert
docker build -t test-pcert .
docker run -d \
  -p 6723:6723 \
  -v /var/zerocert/data:/app/src/data \
  --name test-pcert \
  test-pcert