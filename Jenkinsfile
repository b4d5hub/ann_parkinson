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
                sh 'docker build -t localhost:5000/webapp:latest .'
                sh 'docker push localhost:5000/webapp:latest'
            }
        }
        stage('Deploy Kubernetes') {
            steps {
                sh 'kubectl apply -f deployment.yaml'
                sh 'kubectl apply -f service.yaml'
                sh 'kubectl rollout restart deployment webapp'
            }
        }
    }
}