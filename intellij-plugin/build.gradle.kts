plugins {
  id("java")
  id("org.jetbrains.kotlin.jvm") version "1.8.22"
  id("org.jetbrains.intellij") version "1.15.0"
}

group = "org.fulib"
version = "1.0-SNAPSHOT"

repositories {
  mavenCentral()
}

// Configure Gradle IntelliJ Plugin
// Read more: https://plugins.jetbrains.com/docs/intellij/tools-gradle-intellij-plugin.html
intellij {
  version.set("233-EAP-SNAPSHOT")
  type.set("IU") // Target IDE Platform

  plugins.set(listOf("JavaScript"))
}

tasks {
  // Set the JVM compatibility versions
  withType<JavaCompile> {
    sourceCompatibility = "17"
    targetCompatibility = "17"
  }
  withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions.jvmTarget = "17"
  }

  prepareSandbox {
    doLast {
      copy {
        from("${rootDir}/../vscode-plugin/server/dist/main.js")
        into("${destinationDir.path}/${project.name}/language-server")
      }
    }
  }

  patchPluginXml {
    sinceBuild.set("233")
    untilBuild.set("240.*")
  }

  signPlugin {
    certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
    privateKey.set(System.getenv("PRIVATE_KEY"))
    password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
  }

  publishPlugin {
    token.set(System.getenv("PUBLISH_TOKEN"))
  }
}
