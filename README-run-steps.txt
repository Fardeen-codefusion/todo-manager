PROJECT: To-Do Manager

START MINIKUBE
minikube start --driver=docker

USE MINIKUBE DOCKER
eval $(minikube docker-env)

BUILD IMAGE
cd ~/projects/todo-manager
docker build -t todo-manager:v1 .

APPLY KUBERNETES FILES
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

CHECK RESOURCES
kubectl get all -n todo-app
kubectl get ingress -n todo-app

OPEN SERVICE
minikube service todo-manager-service -n todo-app --url

DEBUG
kubectl logs -n todo-app deploy/todo-manager
kubectl describe pod -n todo-app <pod-name>
kubectl rollout restart deployment todo-manager -n todo-app
