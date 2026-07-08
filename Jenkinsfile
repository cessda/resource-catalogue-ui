def BUILD_CONFIGURATION = 'beta'
def DOCKER_IMAGE = null
def DOCKER_TAG = ''
def DOCKER_IMAGE_SHA = ''

pipeline {
  agent {
    label 'jnlp-himem'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  environment {
    IMAGE_NAME = 'eosc-resource-catalogue-ui'
    REGISTRY = 'europe-west1-docker.pkg.dev/cessda-prod/docker'
    DOCKER_BUILDKIT = '1'
  }

  stages {

    stage('Determine Docker Tag') {
      steps {
        script {
          DOCKER_TAG = sh(script: 'awk -F\'"\' \'/"version"/{print $4; exit}\' package.json', returnStdout: true).trim()
          echo "Docker tag: ${DOCKER_TAG}"
          currentBuild.displayName = "${currentBuild.displayName}-${DOCKER_TAG}"
        }
      }
    }

    stage('Set Build Configuration') {
      when { // 'master' branches and TAG builds
        expression {
          return env.TAG_NAME != null || env.BRANCH_NAME == 'master'
        }
      }
      steps {
        script {
          BUILD_CONFIGURATION = 'prod'
        }
      }
    }

    stage('Build Image') {
      steps{
        script {
          DOCKER_IMAGE = docker.build("${REGISTRY}/${IMAGE_NAME}:${DOCKER_TAG}", "--build-arg configuration=${BUILD_CONFIGURATION} .")
          DOCKER_IMAGE_SHA = sh(script: "docker inspect --format='{{.Id}}' ${DOCKER_IMAGE.id}", returnStdout: true).trim()
        }
      }
    }

    stage('Upload Image') {
      when { // upload images only from 'develop' or 'master' branches and TAG builds
        expression {
          return env.TAG_NAME != null || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master'
        }
      }
      steps {
        script {
          sh """
            echo "Pushing image: ${DOCKER_IMAGE_SHA}"
            gcloud auth configure-docker ${ARTIFACT_REGISTRY_HOST}
          """
          if (env.TAG_NAME) {
            def minorTag = DOCKER_TAG.tokenize('.').take(2).join('.')
            DOCKER_IMAGE.push()
            DOCKER_IMAGE.push(minorTag)
            DOCKER_IMAGE.push("latest")
          } else if (env.BRANCH_NAME == 'master') {
            DOCKER_IMAGE.push("latest")
          } else {
            DOCKER_IMAGE.push("dev")
          }
        }
      }
    }

  }

  post {
    success {
      echo 'Build Successful'
      build job: 'cessda.resource-catalogue.deploy/main', parameters: [string(name: 'FRONTEND_IMAGE_TAG', value: DOCKER_TAG)], wait: false
    }
    always {
      script {
        if (DOCKER_IMAGE_SHA) {
          sh "docker rmi -f ${DOCKER_IMAGE_SHA} || true"
        }
      }
    }
  }
}
