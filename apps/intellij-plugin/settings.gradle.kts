pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

buildscript {
  repositories {
    mavenCentral()
  }

  dependencies {
    classpath("org.jetbrains:markdown:0.7.9")
  }
}

rootProject.name = "fulibFeedback"
