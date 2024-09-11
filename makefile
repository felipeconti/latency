GNUMAKEFLAGS=--no-print-directory
SHELL := /bin/bash

.DEFAULT_GOAL := all

REGISTRY ?= localhost:5001

NAME?=latency

NAMESPACE?=${NAME}

RUN?=

KUBECONFIG?=~/.kube/config

OVERLAY?=local

run: docker-build
	docker run -it --rm \
	-p 8080:8080 \
	${REGISTRY}/${NAME}:latest \
	${RUN}

all:
	$(MAKE) docker-build
	$(MAKE) docker-push
	$(MAKE) deploy-with-rollout

all-cloud:
	REGISTRY=felipeconti $(MAKE) docker-build
	REGISTRY=felipeconti $(MAKE) docker-push
	KUBECONFIG=~/projects/config-workload-tcloud \
	OVERLAY=cloud \
	$(MAKE) deploy-with-rollout
	KUBECONFIG=~/projects/config-workload-vsphere \
	OVERLAY=cloud \
	$(MAKE) deploy-with-rollout

docker-build:
	docker build \
	-f devops/docker/Dockerfile \
	-t ${REGISTRY}/${NAME}:latest \
	.

docker-push:
	docker push ${REGISTRY}/${NAME}:latest

deploy:
	kubectl --kubeconfig ${KUBECONFIG} apply -k devops/deployment/app/${NAME}/overlay/${OVERLAY}

deploy-with-rollout: deploy
	kubectl --kubeconfig ${KUBECONFIG} -n ${NAMESPACE} rollout restart deployment/${NAME}
