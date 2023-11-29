package org.fulib.fulibFeedback

import com.intellij.notification.Notification
import com.intellij.notification.NotificationType
import com.intellij.notification.Notifications
import com.intellij.openapi.application.JBProtocolCommand
import com.intellij.openapi.diagnostic.logger
import org.fulib.fulibFeedback.settings.AppSettingsState

private val LOG = logger<FeedbackJBProtocolCommand>()

class FeedbackJBProtocolCommand : JBProtocolCommand("fulibFeedback") {
  override suspend fun execute(target: String?, parameters: Map<String, String>, fragment: String?): String? {
    LOG.info("fulibFeedback protocol: target=$target, parameters=$parameters, fragment=$fragment")
    if (target == "configure") {
      configure(parameters)
    }
    return null
  }

  private fun configure(parameters: Map<String, String>) {
    val config = AppSettingsState.instance
    val changed = mutableListOf<String>()

    val apiServer = parameters["api_server"]
    val assignment = parameters["assignment"]
    val solution = parameters["solution"]
    val token = parameters["token"]

    if (apiServer != null) {
      config.apiServer = apiServer
      changed.add("API Server: $apiServer")
    }
    if (assignment != null) {
      config.assignmentId = assignment
      changed.add("Assignment ID: $assignment")
    }
    if (solution != null) {
      config.solutionId = solution
      changed.add("Solution ID: $solution")
    }
    if (token != null) {
      if (solution != null) {
        config.solutionToken = token
        changed.add("Solution Token: $token")
      } else {
        config.assignmentToken = token
        changed.add("Assignment Token: $token")
      }
    }
    if (changed.isNotEmpty()) {
      val message = changed.joinToString("\n")
      val notification = Notification(
        "LSP window/showMessage",
        "fulibFeedback Settings Changed",
        message,
        NotificationType.INFORMATION
      )
      Notifications.Bus.notify(notification)
    }
  }
}
