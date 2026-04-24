pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker') {
            steps {
                sh "docker build --build-arg CACHE_BUST=${env.GIT_COMMIT} -t webapp:latest ."
            }
        }
        stage('Deploy Kubernetes') {
            steps {
                sh 'kubectl delete deployment webapp --ignore-not-found'
                sh 'kubectl apply -f deployment.yaml'
                sh 'kubectl apply -f service.yaml'
            }
        }
    }
}