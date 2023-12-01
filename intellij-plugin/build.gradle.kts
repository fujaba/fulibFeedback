import org.intellij.markdown.flavours.gfm.GFMFlavourDescriptor
import org.intellij.markdown.html.HtmlGenerator
import org.intellij.markdown.parser.MarkdownParser

plugins {
  id("java")
  id("org.jetbrains.kotlin.jvm") version "1.8.22"
  id("org.jetbrains.intellij") version "1.16.0"
}

group = "org.fulib"
version = "1.0.2"

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

fun markdown(md: String): String {
  val flavour = GFMFlavourDescriptor()
  val parsedTree = MarkdownParser(flavour).buildMarkdownTreeFromString(md)
  val html = HtmlGenerator(md, parsedTree, flavour).generateHtml()
  return html
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
    from("${rootDir}/../dist/apps/language-server/main.js") {
      into("${project.name}/language-server")
    }
  }

  patchPluginXml {
    sinceBuild.set("233")
    untilBuild.set("240.*")
    pluginDescription.set(markdown(project.file("README.md").readText()))
    changeNotes.set(markdown(project.file("CHANGELOG.md").readText()))
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
