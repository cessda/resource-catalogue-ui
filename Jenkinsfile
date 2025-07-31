pipeline {
  agent any

  environment {
    IMAGE_NAME = "resource-catalogue-ui"
    REGISTRY = "docker.madgik.di.uoa.gr"
    REGISTRY_CRED = 'docker-registry'
    DOCKER_IMAGE = ''
    DOCKER_TAG = ''
    BUILD_CONFIGURATION = 'prod'
  }
  stages {
    stage('Validate Version & Determine Docker Tag') {
      steps {
        script {
          def VERSION
          def PROJECT_VERSION = sh(script: 'cat package.json | grep version | head -1 | sed -e \'s/[ "]*version":[ ]*//g\' | cut -c 2-6', returnStdout: true).trim()
          if (env.BRANCH_NAME == 'develop') {
            VERSION = PROJECT_VERSION
            DOCKER_TAG = '${GIT_COMMIT}-dev'
            BUILD_CONFIGURATION = 'beta'
            echo "Detected develop branch version: ${VERSION}"
          } else if (env.BRANCH_NAME == 'master') {
            VERSION = PROJECT_VERSION
            DOCKER_TAG = "${VERSION}-${GIT_COMMIT}"
            echo "Detected master branch version: ${VERSION}"
          } else if (env.BRANCH_NAME.startsWith('release/')) {
            VERSION = env.BRANCH_NAME.split('/')[1]
            DOCKER_TAG = "${VERSION}-beta"
            echo "Detected release branch version: ${VERSION}"
          } else if (env.TAG_NAME != null) {
            VERSION = env.TAG_NAME.replaceFirst(/^v/, '')
            DOCKER_TAG = VERSION
            echo "Detected tag: ${env.TAG_NAME} (version ${VERSION})"
          } else {
            VERSION = PROJECT_VERSION
            def branch = env.BRANCH_NAME.replace('/', '-')
            DOCKER_TAG = "${VERSION}-${GIT_COMMIT}"
            BUILD_CONFIGURATION = 'beta'
          }
          if ( PROJECT_VERSION != VERSION ) {
            error("Version mismatch. \n\tProject's version:\t${PROJECT_VERSION} \n\tBranch|Tag version:\t${VERSION}")
          }

          currentBuild.displayName = "${currentBuild.displayName}-${DOCKER_TAG}"
        }
      }
    }
    stage('Build Image') {
      steps{
        script {
          DOCKER_IMAGE = docker.build("${REGISTRY}/${IMAGE_NAME}:${DOCKER_TAG}", "--build-arg configuration=${BUILD_CONFIGURATION} .")
        }
      }
    }
    stage('Upload Image') {
      when { // upload images only from 'develop', 'release' or 'master' branches
        expression {
          return env.TAG_NAME != null || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master' || env.BRANCH_NAME.startsWith('release/')
        }
      }
      steps{
        script {
          withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
              sh """
                  echo "Pushing image: ${DOCKER_IMAGE.id}"
                  echo "$DOCKER_PASS" | docker login ${REGISTRY} -u "$DOCKER_USER" --password-stdin
              """
              DOCKER_IMAGE.push()
          }
        }
      }
    }
    stage('Remove Image') {
      steps{
        script {
          sh "docker rmi ${DOCKER_IMAGE.id}"
        }
      }
    }
  }
  // post-build actions
  post {
    success {
      echo 'Build Successful'
    }
    failure {
      echo 'Build Failed'
    }
  }
}
