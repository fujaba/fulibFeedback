package org.fulib.fulibFeedback.settings

import com.intellij.ui.components.JBTextField
import com.intellij.ui.dsl.builder.panel
import javax.swing.JComponent
import javax.swing.JPanel

class AppSettingsComponent {
  val panel: JPanel
  private lateinit var userNameField: JBTextField
  private lateinit var assignmentIdField: JBTextField
  private lateinit var assignmentTokenField: JBTextField
  private lateinit var solutionIdField: JBTextField
  private lateinit var solutionTokenField: JBTextField
  private lateinit var apiServerField: JBTextField

  init {
    panel = panel {
      row("User name") {
        textField().also {
          userNameField = it.component
        }
      }.comment("This is used to connect selections and should match your name on fulib.org.")
      row("API Server") {
        textField().also {
          apiServerField = it.component
        }
      }.comment("The API server for fetching evaluations and sending selections.")
      row("Assignment ID") {
        textField().also {
          assignmentIdField = it.component
        }
      }
      row("Assignment Token") {
        textField().also {
          assignmentTokenField = it.component
        }
      }
      row("Solution ID") {
        textField().also {
          solutionIdField = it.component
        }
      }
      row("Solution Token") {
        textField().also {
          solutionTokenField = it.component
        }
      }
    }
  }

  val preferredFocusedComponent: JComponent
    get() = userNameField

  var userName: String
    get() = userNameField.text
    set(value) {
      userNameField.text = value
    }

  var assignmentId: String
    get() = assignmentIdField.text
    set(value) {
      assignmentIdField.text = value
    }

  var assignmentToken: String
    get() = assignmentTokenField.text
    set(value) {
      assignmentTokenField.text = value
    }

  var solutionId: String
    get() = solutionIdField.text
    set(value) {
      solutionIdField.text = value
    }

  var solutionToken: String
    get() = solutionTokenField.text
    set(value) {
      solutionTokenField.text = value
    }

  var apiServer: String
    get() = apiServerField.text
    set(value) {
      apiServerField.text = value
    }
}
