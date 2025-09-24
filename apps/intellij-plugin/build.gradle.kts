import org.intellij.markdown.flavours.gfm.GFMFlavourDescriptor
import org.intellij.markdown.html.HtmlGenerator
import org.intellij.markdown.parser.MarkdownParser
import org.jetbrains.intellij.platform.gradle.IntelliJPlatformType
import org.jetbrains.intellij.platform.gradle.models.ProductRelease

plugins {
  id("java")
  // https://plugins.gradle.org/plugin/org.jetbrains.kotlin.jvm
  id("org.jetbrains.kotlin.jvm") version "2.1.20"
  // https://plugins.gradle.org/plugin/org.jetbrains.intellij.platform
  id("org.jetbrains.intellij.platform") version "2.9.0"
}

group = "org.fulib"
version = "1.2.0"

repositories {
  mavenCentral()
  intellijPlatform {
    defaultRepositories()
  }
}

dependencies {
  intellijPlatform {
    intellijIdeaUltimate("2024.3")
    // intellijIdeaUltimate("251.23774.318")
    bundledPlugins("JavaScript")
  }
}

tasks {
  // https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin-faq.html#how-to-check-the-latest-available-eap-release
  printProductsReleases {
    channels = listOf(ProductRelease.Channel.EAP)
    types = listOf(IntelliJPlatformType.IntellijIdeaUltimate)
    untilBuild = provider { null }

    doLast {
      val latestEap = productsReleases.get().max()
      println("Latest EAP version: ${latestEap}")
    }
  }
}

fun markdown(text: String): String {
  val md = text.replace("\r", "")
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
    from("${rootDir}/../../dist/apps/language-server/main.js") {
      into("${project.name}/language-server")
    }
  }

  patchPluginXml {
    sinceBuild.set("241")
    untilBuild.set("252.*")
    pluginDescription.set(provider {
      markdown(project.file("README.md").readText())
    })
    changeNotes.set(provider {
      markdown(project.file("CHANGELOG.md").readText())
    })
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
