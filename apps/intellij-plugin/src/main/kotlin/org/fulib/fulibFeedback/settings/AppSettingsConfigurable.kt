package org.fulib.fulibFeedback.settings

import com.intellij.openapi.options.Configurable
import org.jetbrains.annotations.Nls
import javax.swing.JComponent

class AppSettingsConfigurable : Configurable {
  private var mySettingsComponent: AppSettingsComponent? = null

  override fun getDisplayName(): @Nls(capitalization = Nls.Capitalization.Title) String {
    return "fulibFeedback"
  }

  override fun getPreferredFocusedComponent(): JComponent? {
    return mySettingsComponent?.preferredFocusedComponent
  }

  override fun createComponent(): JComponent {
    mySettingsComponent = AppSettingsComponent()
    return mySettingsComponent!!.panel
  }

  override fun isModified(): Boolean {
    val mySettingsComponent = this.mySettingsComponent ?: return false

    val settings: AppSettingsState = AppSettingsState.instance
    var modified = false
    modified = modified or (mySettingsComponent.userName != settings.userName)
    modified = modified or (mySettingsComponent.assignmentId != settings.assignmentId)
    modified = modified or (mySettingsComponent.assignmentToken != settings.assignmentToken)
    modified = modified or (mySettingsComponent.solutionId != settings.solutionId)
    modified = modified or (mySettingsComponent.solutionToken != settings.solutionToken)
    modified = modified or (mySettingsComponent.apiServer != settings.apiServer)
    return modified
  }

  override fun apply() {
    val mySettingsComponent = this.mySettingsComponent ?: return

    val settings: AppSettingsState = AppSettingsState.instance
    settings.userName = mySettingsComponent.userName
    settings.assignmentId = mySettingsComponent.assignmentId
    settings.assignmentToken = mySettingsComponent.assignmentToken
    settings.solutionId = mySettingsComponent.solutionId
    settings.solutionToken = mySettingsComponent.solutionToken
    settings.apiServer = mySettingsComponent.apiServer
  }

  override fun reset() {
    val mySettingsComponent = this.mySettingsComponent ?: return

    val settings: AppSettingsState = AppSettingsState.instance
    mySettingsComponent.userName = settings.userName
    mySettingsComponent.assignmentId = settings.assignmentId
    mySettingsComponent.assignmentToken = settings.assignmentToken
    mySettingsComponent.solutionId = settings.solutionId
    mySettingsComponent.solutionToken = settings.solutionToken
    mySettingsComponent.apiServer = settings.apiServer
  }

  override fun disposeUIResources() {
    mySettingsComponent = null
  }
}
