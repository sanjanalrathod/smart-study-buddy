import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/androidProjectCode';

export async function downloadAndroidProjectZip() {
  const zip = new JSZip();

  // Add all primary code files
  ANDROID_FILES.forEach((file) => {
    zip.file(file.path, file.code);
  });

  // Add settings.gradle
  zip.file(
    'settings.gradle',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "SmartStudyBuddy"
include ':app'
`
  );

  // Add root build.gradle
  zip.file(
    'build.gradle',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.2.2' apply false
}
`
  );

  // Add strings.xml
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">Smart Study Buddy</string>
    <string name="title_ai_tutor">AI Tutor</string>
    <string name="title_notes">My Notes</string>
    <string name="title_quiz">Practice Quiz</string>
    <string name="title_planner">Study Planner</string>
    <string name="title_pdf_summarizer">PDF Summarizer</string>
</resources>
`
  );

  // Add colors.xml
  zip.file(
    'app/src/main/res/values/colors.xml',
    `<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="primary_blue">#2563EB</color>
    <color name="primary_emerald">#059669</color>
    <color name="primary_purple">#7C3AED</color>
</resources>
`
  );

  // Add themes.xml
  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.SmartStudyBuddy" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/primary_blue</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorOnPrimary">@color/white</item>
    </style>
</resources>
`
  );

  // Add README.md
  zip.file(
    'README.md',
    `# Smart Study Buddy - Android Application (Java)

A complete Android college companion app built using Java, Android Studio, Material 3, and SQLite.

## Features Included:
1. **AI Tutor**: Breaks complex concepts into plain English, analogies, and exam breakdowns.
2. **Offline Notes**: SQLite-backed local note-taking with subjects and search (100% free).
3. **Quiz Generator**: Generates practice multiple-choice questions with instant explanations.
4. **Study Planner & Pomodoro Timer**: Countdown to exams and 25-minute focus intervals.
5. **PDF & Document Summarizer**: Condenses lengthy academic material into high-yield takeaways.

## How to Run in Android Studio (Beginner Guide):
1. Download & Install Android Studio from https://developer.android.com/studio
2. Extract this ZIP folder on your computer.
3. Open Android Studio and click **Open**, then select the extracted folder.
4. Wait for Gradle Sync to complete.
5. Open \`app/src/main/java/com/smartstudybuddy/app/GeminiApiClient.java\` and paste your free Google AI Studio API key (https://aistudio.google.com).
6. Plug your Android smartphone via USB (with USB Debugging enabled) or start an Android Virtual Device (AVD).
7. Click the green **Run** (Play) button in Android Studio!

Happy studying!
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'SmartStudyBuddy-Android-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
