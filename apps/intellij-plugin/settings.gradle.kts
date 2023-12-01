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
    classpath("org.jetbrains:markdown:0.5.0")
  }
}

rootProject.name = "fulibFeedback"
