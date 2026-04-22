pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/b4d5hub/ann_parkinson.git'
            }
        }

        stage('Build Docker') {
            steps {
                sh  'docker build -t webapp:latest .'
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                sh 'kubectl apply -f deployment.yaml'
                sh 'kubectl apply -f service.yaml'
            }
        }
    }
}