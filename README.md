# Deployment Documentation

1. Clone the Repository 
2. Build and Tag the Docker Image
3. Check the Docker Image
4. Push the Image to Docker Hub
5. Deploy the Application in Kubernetes
6. Expose Using Ingress
7. Access the Application


## 1. Clone the Repository 
Clone the GitHub repository to your local machine. 

```sh
git clone https://github.com/sentinelfoxinc/todo_app.git
```

When you clone a repository, you copy the repository from GitHub.com to your local machine. You can clone a repository from GitHub.com to your local computer to make it easier to fix merge conflicts, add or remove files, and push larger commits.

You can also check the branch of the git repo. After cloning a project from a remote server, the resulting local repository is placed in main branch. You can swtich the branch to the project repository.

```sh
git checkout kubernetes
```

## 2. Build and Tag the Docker Image

Building a Docker image is the process of creating a Docker image based on instructions in a Dockerfile.

TAG : A custom, human-readable identifier that's typically used to identify different versions or variants of an image. If no tag is specified, latest is used by default

```sh
$ docker build -t todo:latest .
```

The Following Dockerfile containing instruction of creating ToDo application.


```Dockerfile
FROM node:lts-alpine3.15

WORKDIR /app/

COPY . /app

ENV PORT=3030
ENV API_PORT=4040

EXPOSE 3030 4040

RUN npm install
RUN npm install pm2 -g

COPY --chown=node:node ./start.sh /app/start.sh
RUN chmod +x ./start.sh
CMD ./start.sh
```

## 3. Check the Docker Image

Docker Compose is a tool you can use to define and share multi-container applications. This means you can run a project with multiple containers using a single source. For example, assume you're building a project with NodeJS and MongoDB together.

The following Docker Compose file is used to run ToDo application it build with NodeJS and MySql together.

```yaml
version: "3"
services:
  todo:
    build: .
    ports:
      - 3030:3030
      - 4040:4040
    environment:
      - MYSQL_HOST=mysql
      - MYSQL_USER=root
      - MYSQL_PASSWORD=password
      - MYSQL_DATABASE=todo
      - PORT=3030
    depends_on:
      mysql: 
        condition: service_healthy
    networks:
      - todo
      
  mysql:
    image: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=todo
    ports:
      - 3306:3306
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - todo
networks:
  todo:
volumes:
  mysql_data:
```

You check ToDo application is correctly running or not. Using Docker Compose file to up your compose file and check your application

```sh
$ docker-compose up -d 
```

## 4. Push the Image to Docker Hub

Docker Hub is a cloud-based registry that allows users to find, share, and manage container images. Docker Hub is a public registry that anyone can use and is the default registry.

### Push image to Docker Hub
1. Login to Docker Hub.

```sh
docker login
```
2. Retag image with your Docker Hub username (USERNAEM/IMAGE-NAME)

```sh 
$ docker tag todo <USERNAME>/todo .
```
3. Push the image to Docker Hub
```sh
$ docker push <USERNAME>/todo
```

## 5. Deploy the Application in Kubernetes
A Kubernetes Deployment tells Kubernetes how to create or modify instances of the pods that hold a containerized application. Deployments can help to efficiently scale the number of replica pods, enable the rollout of updated code in a controlled manner, or roll back to an earlier deployment version if necessary.

### todo app deployment

The following deployment yaml file is used to create deployment for the todo app. 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: todo-app
  name: todo-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-app
  template:
    metadata:
      labels:
        app: todo-app
    spec:
      containers:
      - image: alpha260/todo:v4
        name: todo-app
        env:
        - name: API_URL
          value: http://api.alphonsa.todo
        - name: MYSQL_HOST
          value: mysql.default.svc.cluster.local
        - name: MYSQL_USER
          value: root
        - name: MYSQL_PASSWORD
          value: passowrd
        - name: MYSQL_DATABASE
          value: todo
        ports:
        - containerPort: 3030
---
apiVersion: v1
kind: Service
metadata:
  name: todo-app
spec:
  selector:
    app: todo-app
  ports:
    - protocol: TCP
      port: 3030
      targetPort: 3030
  type: ClusterIP
```

It use the evironment variable from docker-compose.yaml file.
### todo api deployment

Then create another deployment for backend it use the same image and container port 4040 docker compose file.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: todo-api
  name: todo-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-api
  template:
    metadata:
      labels:
        app: todo-api
    spec:
      containers:
      - image: alpha260/todo:v4
        name: todo-api
        ports:
        - containerPort: 4040
        env:
        - name: API_URL
          value: http://api.alphonsa.todo
        - name: MYSQL_HOST
          value: mysql.default.svc.cluster.local
        - name: MYSQL_USER
          value: root
        - name: MYSQL_PASSWORD
          value: passowrd
        - name: MYSQL_DATABASE
          value: todo
---
apiVersion: v1
kind: Service
metadata:
  name: todo-api
spec:
  selector:
    app: todo-api
  ports:
    - protocol: TCP
      port: 4040
      targetPort: 4040
  type: ClusterIP
```

### mysql statefulset
A StatefulSet runs a group of Pods, and maintains a sticky identity for each of those Pods. This is useful for managing applications that need persistent storage or a stable, unique network identity.
StatefulSet is the workload API object used to manage stateful applications.

A MySQL statefulset in Kubernetes is a tool that manages the deployment, scaling, and ordering of a set of pods for a MySQL database application. Also create the service for the mysql statefulset.
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  serviceName: "mysql"
  replicas: 1
  template:
    metadata:
      labels:
        app: mysql
    spec:
      terminationGracePeriodSeconds: 30
      containers:
      - name: mysql
        image: mysql
        ports:
        - containerPort: 3306
          name: mysql
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: passowrd
        - name: MYSQL_DATABASE
          value: todo
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  clusterIP: "None"
  selector:
    app: mysql
  ports:
    - name: mysql
      port: 3306       
```


## 6. Expose Using Ingress
In Kubernetes, ingress is an API object that manages external access to services within a cluster. It allows users to expose services without creating multiple load balancers.

Create Ingress for both app and api.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host:  app.alphonsa.todo
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: todo-app
            port:
              number: 3030
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-api-ingress
  # annotations:
    # nginx.ingress.kubernetes.io/rewrite-target: /api/$1
spec:
  rules:
  - host:  api.alphonsa.todo
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: todo-api
            port:
              number: 4040
```

## 7. Access the Application
To access your application to local test using ``` minikube tunnel ``` or you can use ip in browser.



