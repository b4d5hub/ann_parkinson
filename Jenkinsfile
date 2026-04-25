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
                sh 'docker rmi webapp:latest --force || true'
                sh 'docker build --no-cache -t webapp:latest .'
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                sh 'kubectl delete deployment webapp --ignore-not-found'
                sh 'kubectl apply -f deployment.yaml'
                sh 'kubectl apply -f service.yaml'
                sh 'kubectl rollout status deployment webapp'
            }
        }
    }
}