package org.fulib.fulibFeedback.settings

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import com.intellij.util.xmlb.XmlSerializerUtil

@State(name = "org.intellij.sdk.settings.AppSettingsState", storages = [Storage("fulibFeedbackPlugin.xml"), ])
class AppSettingsState : PersistentStateComponent<AppSettingsState?> {
  var userName: String? = null
  var assignmentId: String? = null
  var assignmentToken: String? = null
  var solutionId: String? = null
  var solutionToken: String? = null
  var apiServer = "https://fulib.org/api/v1"

  override fun getState(): AppSettingsState? {
    return this
  }

  override fun loadState(state: AppSettingsState) {
    XmlSerializerUtil.copyBean(state, this)
  }

  fun asConfiguration(): Any {
    return mapOf(
      "user" to mapOf(
        "name" to userName,
      ),
      "assignment" to mapOf(
        "id" to assignmentId,
        "token" to assignmentToken,
      ),
      "solution" to mapOf(
        "id" to solutionId,
        "token" to solutionToken,
      ),
      "apiServer" to apiServer,
    )
  }

  companion object {
    val instance: AppSettingsState by lazy {
      ApplicationManager.getApplication().getService(AppSettingsState::class.java)
    }
  }
}
