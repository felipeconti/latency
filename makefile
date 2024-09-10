GNUMAKEFLAGS=--no-print-directory
SHELL := /bin/bash

.DEFAULT_GOAL := all

REGISTRY ?= localhost:5001

LOGGING_LEVEL?=debug

NAME?=latency

NAMESPACE?=${NAME}

RUN?=/sources/app

run: docker-build
	docker run -it --rm \
	-p 8080:8080 \
	${REGISTRY}/${NAME}:latest \
	${RUN}

all:
	$(MAKE) docker-build
	$(MAKE) docker-push
	$(MAKE) deploy
	$(MAKE) deploy-rollout

docker-build:
	docker build \
	-f devops/docker/Dockerfile \
	-t ${REGISTRY}/${NAME}:latest \
	.

docker-push:
	docker push ${REGISTRY}/${NAME}:latest

deploy:
	kubectl apply -k devops/deployment/app/${NAME}/overlay/local

deploy-rollout:
	kubectl -n ${NAMESPACE} rollout restart deployment/${NAME}
