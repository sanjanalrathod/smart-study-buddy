export interface CodeFile {
  filename: string;
  path: string;
  language: 'java' | 'xml' | 'gradle' | 'markdown';
  description: string;
  code: string;
}

export const ANDROID_FILES: CodeFile[] = [
  {
    filename: 'MainActivity.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/MainActivity.java',
    language: 'java',
    description: 'Main Hub activity with navigation to AI Tutor, Notes, Quiz, Planner, and PDF Summarizer.',
    code: `package com.smartstudybuddy.app;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    private CardView cardAiTutor, cardNotes, cardQuiz, cardPlanner, cardPdfSummarizer;
    private TextView tvWelcomeStatus;
    private DatabaseHelper dbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize SQLite Database Helper (100% Free, Local)
        dbHelper = new DatabaseHelper(this);

        // Bind UI Components
        cardAiTutor = findViewById(R.id.cardAiTutor);
        cardNotes = findViewById(R.id.cardNotes);
        cardQuiz = findViewById(R.id.cardQuiz);
        cardPlanner = findViewById(R.id.cardPlanner);
        cardPdfSummarizer = findViewById(R.id.cardPdfSummarizer);
        tvWelcomeStatus = findViewById(R.id.tvWelcomeStatus);

        int notesCount = dbHelper.getNotesCount();
        tvWelcomeStatus.setText("Ready to study! You have " + notesCount + " notes saved.");

        // Set Up Click Listeners for Navigation
        cardAiTutor.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, AITutorActivity.class);
            startActivity(intent);
        });

        cardNotes.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, NotesActivity.class);
            startActivity(intent);
        });

        cardQuiz.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, QuizActivity.class);
            startActivity(intent);
        });

        cardPlanner.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, StudyPlannerActivity.class);
            startActivity(intent);
        });

        cardPdfSummarizer.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, PdfSummarizerActivity.class);
            startActivity(intent);
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (dbHelper != null && tvWelcomeStatus != null) {
            int notesCount = dbHelper.getNotesCount();
            tvWelcomeStatus.setText("Ready to study! You have " + notesCount + " notes saved.");
        }
    }
}`
  },
  {
    filename: 'AITutorActivity.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/AITutorActivity.java',
    language: 'java',
    description: 'AI Tutor screen that simplifies tough topics into ELI5, Simple Student, or Exam Master explanations.',
    code: `package com.smartstudybuddy.app;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

public class AITutorActivity extends AppCompatActivity {

    private EditText etTopicPrompt;
    private RadioGroup rgExplanationMode;
    private Button btnAskTutor, btnSaveToNotes;
    private ProgressBar progressBar;
    private TextView tvExplanationResult;
    private DatabaseHelper dbHelper;
    private String lastGeneratedTopic = "";
    private String lastGeneratedContent = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ai_tutor);

        dbHelper = new DatabaseHelper(this);

        etTopicPrompt = findViewById(R.id.etTopicPrompt);
        rgExplanationMode = findViewById(R.id.rgExplanationMode);
        btnAskTutor = findViewById(R.id.btnAskTutor);
        btnSaveToNotes = findViewById(R.id.btnSaveToNotes);
        progressBar = findViewById(R.id.progressBar);
        tvExplanationResult = findViewById(R.id.tvExplanationResult);

        btnAskTutor.setOnClickListener(v -> {
            String topic = etTopicPrompt.getText().toString().trim();
            if (topic.isEmpty()) {
                Toast.makeText(this, "Please enter a topic or concept to explain", Toast.LENGTH_SHORT).show();
                return;
            }

            int selectedId = rgExplanationMode.getCheckedRadioButtonId();
            String mode = "simple";
            if (selectedId == R.id.rbEli5) {
                mode = "eli5";
            } else if (selectedId == R.id.rbExam) {
                mode = "exam_master";
            }

            requestAiExplanation(topic, mode);
        });

        btnSaveToNotes.setOnClickListener(v -> {
            if (lastGeneratedContent.isEmpty()) {
                Toast.makeText(this, "No explanation to save yet", Toast.LENGTH_SHORT).show();
                return;
            }
            long id = dbHelper.insertNote("AI Tutor: " + lastGeneratedTopic, lastGeneratedContent, "AI Tutor", "Study Notes");
            if (id > 0) {
                Toast.makeText(this, "Saved to your Notes!", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void requestAiExplanation(String topic, String mode) {
        progressBar.setVisibility(View.VISIBLE);
        btnAskTutor.setEnabled(false);
        tvExplanationResult.setText("Thinking... Smart Study Buddy is breaking this down simply...");

        GeminiApiClient.explainTopic(topic, mode, new GeminiApiClient.ApiCallback() {
            @Override
            public void onSuccess(String responseText) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnAskTutor.setEnabled(true);
                    btnSaveToNotes.setVisibility(View.VISIBLE);
                    tvExplanationResult.setText(responseText);
                    lastGeneratedTopic = topic;
                    lastGeneratedContent = responseText;
                });
            }

            @Override
            public void onFailure(String errorMessage) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnAskTutor.setEnabled(true);
                    tvExplanationResult.setText("Error: " + errorMessage + "\\n\\nOffline Tip: Review core definitions and break the problem into smaller sub-steps.");
                });
            }
        });
    }
}`
  },
  {
    filename: 'DatabaseHelper.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/DatabaseHelper.java',
    language: 'java',
    description: 'SQLite database helper (100% free, offline, zero server cost) for notes, tasks, and quizzes.',
    code: `package com.smartstudybuddy.app;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "SmartStudyBuddy.db";
    private static final int DATABASE_VERSION = 1;

    // Table: Notes
    public static final String TABLE_NOTES = "notes";
    public static final String COLUMN_NOTE_ID = "id";
    public static final String COLUMN_NOTE_TITLE = "title";
    public static final String COLUMN_NOTE_CONTENT = "content";
    public static final String COLUMN_NOTE_SUBJECT = "subject";
    public static final String COLUMN_NOTE_TAGS = "tags";
    public static final String COLUMN_NOTE_DATE = "created_date";

    // Table: Planner Tasks
    public static final String TABLE_TASKS = "tasks";
    public static final String COLUMN_TASK_ID = "id";
    public static final String COLUMN_TASK_TITLE = "title";
    public static final String COLUMN_TASK_DUE = "due_date";
    public static final String COLUMN_TASK_DONE = "is_done";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_NOTES_TABLE = "CREATE TABLE " + TABLE_NOTES + " ("
                + COLUMN_NOTE_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COLUMN_NOTE_TITLE + " TEXT, "
                + COLUMN_NOTE_CONTENT + " TEXT, "
                + COLUMN_NOTE_SUBJECT + " TEXT, "
                + COLUMN_NOTE_TAGS + " TEXT, "
                + COLUMN_NOTE_DATE + " TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ")";
        db.execSQL(CREATE_NOTES_TABLE);

        String CREATE_TASKS_TABLE = "CREATE TABLE " + TABLE_TASKS + " ("
                + COLUMN_TASK_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COLUMN_TASK_TITLE + " TEXT, "
                + COLUMN_TASK_DUE + " TEXT, "
                + COLUMN_TASK_DONE + " INTEGER DEFAULT 0"
                + ")";
        db.execSQL(CREATE_TASKS_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_NOTES);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_TASKS);
        onCreate(db);
    }

    // Insert Note
    public long insertNote(String title, String content, String subject, String tags) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_NOTE_TITLE, title);
        values.put(COLUMN_NOTE_CONTENT, content);
        values.put(COLUMN_NOTE_SUBJECT, subject);
        values.put(COLUMN_NOTE_TAGS, tags);
        long id = db.insert(TABLE_NOTES, null, values);
        db.close();
        return id;
    }

    // Get Notes Count
    public int getNotesCount() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT COUNT(*) FROM " + TABLE_NOTES, null);
        int count = 0;
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }
        cursor.close();
        db.close();
        return count;
    }

    // Get All Notes
    public Cursor getAllNotes() {
        SQLiteDatabase db = this.getReadableDatabase();
        return db.rawQuery("SELECT * FROM " + TABLE_NOTES + " ORDER BY " + COLUMN_NOTE_ID + " DESC", null);
    }

    // Delete Note
    public void deleteNote(int id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_NOTES, COLUMN_NOTE_ID + "=?", new String[]{String.valueOf(id)});
        db.close();
    }
}`
  },
  {
    filename: 'NotesActivity.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/NotesActivity.java',
    language: 'java',
    description: 'Notes management activity with SQLite storage, category tagging, search, and instant note creation.',
    code: `package com.smartstudybuddy.app;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import android.database.Cursor;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.Toast;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.ArrayList;

public class NotesActivity extends AppCompatActivity {

    private ListView listViewNotes;
    private FloatingActionButton fabAddNote;
    private DatabaseHelper dbHelper;
    private ArrayList<String> noteTitlesList;
    private ArrayList<Integer> noteIdsList;
    private ArrayAdapter<String> adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notes);

        dbHelper = new DatabaseHelper(this);
        listViewNotes = findViewById(R.id.listViewNotes);
        fabAddNote = findViewById(R.id.fabAddNote);

        noteTitlesList = new ArrayList<>();
        noteIdsList = new ArrayList<>();

        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, noteTitlesList);
        listViewNotes.setAdapter(adapter);

        loadNotes();

        fabAddNote.setOnClickListener(v -> showAddNoteDialog());

        listViewNotes.setOnItemLongClickListener((parent, view, position, id) -> {
            int noteId = noteIdsList.get(position);
            new AlertDialog.Builder(this)
                .setTitle("Delete Note")
                .setMessage("Delete this note from Smart Study Buddy?")
                .setPositiveButton("Delete", (dialog, which) -> {
                    dbHelper.deleteNote(noteId);
                    loadNotes();
                    Toast.makeText(this, "Note deleted", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
            return true;
        });
    }

    private void loadNotes() {
        noteTitlesList.clear();
        noteIdsList.clear();
        Cursor cursor = dbHelper.getAllNotes();
        if (cursor.moveToFirst()) {
            do {
                int id = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_NOTE_ID));
                String title = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_NOTE_TITLE));
                String subject = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_NOTE_SUBJECT));
                noteIdsList.add(id);
                noteTitlesList.add("[" + subject + "] " + title);
            } while (cursor.moveToNext());
        }
        cursor.close();
        adapter.notifyDataSetChanged();
    }

    private void showAddNoteDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_add_note, null);
        builder.setView(dialogView);

        EditText etTitle = dialogView.findViewById(R.id.etDialogTitle);
        EditText etContent = dialogView.findViewById(R.id.etDialogContent);
        Spinner spSubject = dialogView.findViewById(R.id.spDialogSubject);

        builder.setTitle("New Study Note")
               .setPositiveButton("Save", (dialog, which) -> {
                   String title = etTitle.getText().toString().trim();
                   String content = etContent.getText().toString().trim();
                   String subject = spSubject.getSelectedItem().toString();

                   if (!title.isEmpty() && !content.isEmpty()) {
                       dbHelper.insertNote(title, content, subject, "Study");
                       loadNotes();
                       Toast.makeText(this, "Note saved!", Toast.LENGTH_SHORT).show();
                   } else {
                       Toast.makeText(this, "Title and Content cannot be empty", Toast.LENGTH_SHORT).show();
                   }
               })
               .setNegativeButton("Cancel", null)
               .create()
               .show();
    }
}`
  },
  {
    filename: 'QuizActivity.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/QuizActivity.java',
    language: 'java',
    description: 'Dynamic Quiz generator & interactive test-taker with instant scoring and explanations.',
    code: `package com.smartstudybuddy.app;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;

public class QuizActivity extends AppCompatActivity {

    private EditText etQuizTopic;
    private Button btnGenerateQuiz, btnSubmitAnswer, btnNextQuestion;
    private ProgressBar progressBar;
    private LinearLayout layoutQuizPlay;
    private TextView tvQuestionNumber, tvQuestionText, tvExplanation;
    private RadioGroup rgOptions;
    private RadioButton rbOption0, rbOption1, rbOption2, rbOption3;

    private static class QuestionItem {
        String question;
        String[] options;
        int correctIndex;
        String explanation;
    }

    private ArrayList<QuestionItem> questionList = new ArrayList<>();
    private int currentQuestionIndex = 0;
    private int userScore = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_quiz);

        etQuizTopic = findViewById(R.id.etQuizTopic);
        btnGenerateQuiz = findViewById(R.id.btnGenerateQuiz);
        progressBar = findViewById(R.id.progressBarQuiz);
        layoutQuizPlay = findViewById(R.id.layoutQuizPlay);

        tvQuestionNumber = findViewById(R.id.tvQuestionNumber);
        tvQuestionText = findViewById(R.id.tvQuestionText);
        tvExplanation = findViewById(R.id.tvExplanation);
        rgOptions = findViewById(R.id.rgOptions);
        rbOption0 = findViewById(R.id.rbOption0);
        rbOption1 = findViewById(R.id.rbOption1);
        rbOption2 = findViewById(R.id.rbOption2);
        rbOption3 = findViewById(R.id.rbOption3);

        btnSubmitAnswer = findViewById(R.id.btnSubmitAnswer);
        btnNextQuestion = findViewById(R.id.btnNextQuestion);

        btnGenerateQuiz.setOnClickListener(v -> {
            String topic = etQuizTopic.getText().toString().trim();
            if (topic.isEmpty()) {
                Toast.makeText(this, "Enter a topic to generate questions", Toast.LENGTH_SHORT).show();
                return;
            }
            generateQuizFromApi(topic);
        });

        btnSubmitAnswer.setOnClickListener(v -> checkAnswer());
        btnNextQuestion.setOnClickListener(v -> moveToNextQuestion());
    }

    private void generateQuizFromApi(String topic) {
        progressBar.setVisibility(View.VISIBLE);
        btnGenerateQuiz.setEnabled(false);
        layoutQuizPlay.setVisibility(View.GONE);

        GeminiApiClient.generateQuiz(topic, 5, "Medium", new GeminiApiClient.ApiCallback() {
            @Override
            public void onSuccess(String jsonResponse) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnGenerateQuiz.setEnabled(true);
                    parseQuizJson(jsonResponse);
                });
            }

            @Override
            public void onFailure(String error) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnGenerateQuiz.setEnabled(true);
                    Toast.makeText(QuizActivity.this, "Error generating quiz: " + error, Toast.LENGTH_LONG).show();
                });
            }
        });
    }

    private void parseQuizJson(String jsonStr) {
        try {
            JSONObject obj = new JSONObject(jsonStr);
            JSONArray array = obj.getJSONArray("questions");
            questionList.clear();

            for (int i = 0; i < array.length(); i++) {
                JSONObject qObj = array.getJSONObject(i);
                QuestionItem item = new QuestionItem();
                item.question = qObj.getString("question");
                JSONArray opts = qObj.getJSONArray("options");
                item.options = new String[opts.length()];
                for (int j = 0; j < opts.length(); j++) {
                    item.options[j] = opts.getString(j);
                }
                item.correctIndex = qObj.getInt("correctIndex");
                item.explanation = qObj.getString("explanation");
                questionList.add(item);
            }

            if (!questionList.isEmpty()) {
                currentQuestionIndex = 0;
                userScore = 0;
                layoutQuizPlay.setVisibility(View.VISIBLE);
                displayQuestion(0);
            }
        } catch (Exception e) {
            Toast.makeText(this, "JSON parse error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void displayQuestion(int index) {
        QuestionItem item = questionList.get(index);
        tvQuestionNumber.setText("Question " + (index + 1) + " of " + questionList.size());
        tvQuestionText.setText(item.question);

        rbOption0.setText(item.options[0]);
        rbOption1.setText(item.options[1]);
        rbOption2.setText(item.options[2]);
        rbOption3.setText(item.options[3]);

        rgOptions.clearCheck();
        for (int i = 0; i < rgOptions.getChildCount(); i++) {
            rgOptions.getChildAt(i).setEnabled(true);
        }

        tvExplanation.setVisibility(View.GONE);
        btnSubmitAnswer.setVisibility(View.VISIBLE);
        btnNextQuestion.setVisibility(View.GONE);
    }

    private void checkAnswer() {
        int selectedId = rgOptions.getCheckedRadioButtonId();
        if (selectedId == -1) {
            Toast.makeText(this, "Please select an answer", Toast.LENGTH_SHORT).show();
            return;
        }

        int selectedIndex = 0;
        if (selectedId == R.id.rbOption1) selectedIndex = 1;
        else if (selectedId == R.id.rbOption2) selectedIndex = 2;
        else if (selectedId == R.id.rbOption3) selectedIndex = 3;

        QuestionItem item = questionList.get(currentQuestionIndex);
        boolean isCorrect = (selectedIndex == item.correctIndex);

        if (isCorrect) {
            userScore++;
            tvExplanation.setText("Correct! \\n\\n" + item.explanation);
            tvExplanation.setTextColor(0xFF2E7D32);
        } else {
            tvExplanation.setText("Incorrect. The right answer was Option " + (char)('A' + item.correctIndex) + ".\\n\\n" + item.explanation);
            tvExplanation.setTextColor(0xFFC62828);
        }

        tvExplanation.setVisibility(View.VISIBLE);
        btnSubmitAnswer.setVisibility(View.GONE);
        btnNextQuestion.setVisibility(View.VISIBLE);

        for (int i = 0; i < rgOptions.getChildCount(); i++) {
            rgOptions.getChildAt(i).setEnabled(false);
        }
    }

    private void moveToNextQuestion() {
        if (currentQuestionIndex < questionList.size() - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        } else {
            Toast.makeText(this, "Quiz Finished! Score: " + userScore + "/" + questionList.size(), Toast.LENGTH_LONG).show();
            tvQuestionText.setText("Quiz Complete! Your Score: " + userScore + " / " + questionList.size());
            rgOptions.setVisibility(View.GONE);
            btnNextQuestion.setVisibility(View.GONE);
            tvExplanation.setText("Great job practicing! Consistent testing improves exam retention by over 50%.");
        }
    }
}`
  },
  {
    filename: 'StudyPlannerActivity.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/StudyPlannerActivity.java',
    language: 'java',
    description: 'Exam study planner with Pomodoro focus timer, milestone roadmaps, and checklist.',
    code: `package com.smartstudybuddy.app;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import java.util.Locale;

public class StudyPlannerActivity extends AppCompatActivity {

    private TextView tvTimerCountdown, tvTimerStatus;
    private Button btnStartTimer, btnResetTimer;
    private EditText etExamTitle, etExamDate;
    private Button btnCreateRoadmap;
    private TextView tvRoadmapOutput;

    private CountDownTimer countDownTimer;
    private boolean isTimerRunning = false;
    private long timeLeftInMillis = 25 * 60 * 1000; // 25 min default Pomodoro

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_study_planner);

        tvTimerCountdown = findViewById(R.id.tvTimerCountdown);
        tvTimerStatus = findViewById(R.id.tvTimerStatus);
        btnStartTimer = findViewById(R.id.btnStartTimer);
        btnResetTimer = findViewById(R.id.btnResetTimer);

        etExamTitle = findViewById(R.id.etExamTitle);
        etExamDate = findViewById(R.id.etExamDate);
        btnCreateRoadmap = findViewById(R.id.btnCreateRoadmap);
        tvRoadmapOutput = findViewById(R.id.tvRoadmapOutput);

        updateTimerDisplay();

        btnStartTimer.setOnClickListener(v -> {
            if (isTimerRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        });

        btnResetTimer.setOnClickListener(v -> resetTimer());

        btnCreateRoadmap.setOnClickListener(v -> {
            String title = etExamTitle.getText().toString().trim();
            String date = etExamDate.getText().toString().trim();

            if (title.isEmpty()) {
                Toast.makeText(this, "Enter your exam or subject name", Toast.LENGTH_SHORT).show();
                return;
            }

            tvRoadmapOutput.setText("Plan for " + title + " (Exam: " + date + "):\\n\\n"
                + "• Phase 1 (Foundation): Read syllabus & identify weak topics.\\n"
                + "• Phase 2 (Active Recall): Create flashcards & do practice questions.\\n"
                + "• Phase 3 (Spaced Repetition): Review summaries 3 days before.\\n"
                + "• Phase 4 (Mock Exam): Timed past paper test 24 hours prior.");
        });
    }

    private void startTimer() {
        countDownTimer = new CountDownTimer(timeLeftInMillis, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                timeLeftInMillis = millisUntilFinished;
                updateTimerDisplay();
            }

            @Override
            public void onFinish() {
                isTimerRunning = false;
                btnStartTimer.setText("Start Study");
                tvTimerStatus.setText("Session Complete! Take a 5-minute break.");
                Toast.makeText(StudyPlannerActivity.this, "Great study session done!", Toast.LENGTH_LONG).show();
            }
        }.start();

        isTimerRunning = true;
        btnStartTimer.setText("Pause");
        tvTimerStatus.setText("Focus Mode Active - Stay off social media!");
    }

    private void pauseTimer() {
        if (countDownTimer != null) {
            countDownTimer.cancel();
        }
        isTimerRunning = false;
        btnStartTimer.setText("Resume");
        tvTimerStatus.setText("Paused");
    }

    private void resetTimer() {
        if (countDownTimer != null) {
            countDownTimer.cancel();
        }
        timeLeftInMillis = 25 * 60 * 1000;
        isTimerRunning = false;
        updateTimerDisplay();
        btnStartTimer.setText("Start Study");
        tvTimerStatus.setText("Ready for 25-minute Pomodoro");
    }

    private void updateTimerDisplay() {
        int minutes = (int) (timeLeftInMillis / 1000) / 60;
        int seconds = (int) (timeLeftInMillis / 1000) % 60;
        tvTimerCountdown.setText(String.format(Locale.getDefault(), "%02d:%02d", minutes, seconds));
    }
}`
  },
  {
    filename: 'PdfSummarizerActivity.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/PdfSummarizerActivity.java',
    language: 'java',
    description: 'Document and PDF summarizer converting lengthy textbook/lecture pages into high-yield summaries.',
    code: `package com.smartstudybuddy.app;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class PdfSummarizerActivity extends AppCompatActivity {

    private EditText etPdfNotesInput;
    private Button btnSummarize, btnSaveSummaryToNotes;
    private ProgressBar progressBar;
    private TextView tvSummaryOutput;
    private DatabaseHelper dbHelper;
    private String lastSummaryText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pdf_summarizer);

        dbHelper = new DatabaseHelper(this);

        etPdfNotesInput = findViewById(R.id.etPdfNotesInput);
        btnSummarize = findViewById(R.id.btnSummarize);
        btnSaveSummaryToNotes = findViewById(R.id.btnSaveSummaryToNotes);
        progressBar = findViewById(R.id.progressBarSummary);
        tvSummaryOutput = findViewById(R.id.tvSummaryOutput);

        btnSummarize.setOnClickListener(v -> {
            String text = etPdfNotesInput.getText().toString().trim();
            if (text.isEmpty()) {
                Toast.makeText(this, "Paste textbook/lecture notes or PDF text to summarize", Toast.LENGTH_SHORT).show();
                return;
            }
            summarizeText(text);
        });

        btnSaveSummaryToNotes.setOnClickListener(v -> {
            if (lastSummaryText.isEmpty()) {
                Toast.makeText(this, "No summary generated yet", Toast.LENGTH_SHORT).show();
                return;
            }
            dbHelper.insertNote("Summary: High-Yield Notes", lastSummaryText, "Summary", "High-Yield");
            Toast.makeText(this, "Summary saved to your Notes!", Toast.LENGTH_SHORT).show();
        });
    }

    private void summarizeText(String text) {
        progressBar.setVisibility(View.VISIBLE);
        btnSummarize.setEnabled(false);
        tvSummaryOutput.setText("Distilling core concepts...");

        GeminiApiClient.summarizeDocument(text, new GeminiApiClient.ApiCallback() {
            @Override
            public void onSuccess(String responseText) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnSummarize.setEnabled(true);
                    btnSaveSummaryToNotes.setVisibility(View.VISIBLE);
                    tvSummaryOutput.setText(responseText);
                    lastSummaryText = responseText;
                });
            }

            @Override
            public void onFailure(String error) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnSummarize.setEnabled(true);
                    tvSummaryOutput.setText("Failed to summarize: " + error);
                });
            }
        });
    }
}`
  },
  {
    filename: 'GeminiApiClient.java',
    path: 'app/src/main/java/com/smartstudybuddy/app/GeminiApiClient.java',
    language: 'java',
    description: 'Free Google AI Studio / Gemini API client in Java using standard Android OkHttp.',
    code: `package com.smartstudybuddy.app;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class GeminiApiClient {

    // Obtain your free API key at: https://aistudio.google.com
    public static final String API_KEY = "YOUR_GEMINI_API_KEY_HERE";
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

    private static final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();

    public interface ApiCallback {
        void onSuccess(String response);
        void onFailure(String error);
    }

    public static void explainTopic(String topic, String mode, ApiCallback callback) {
        String prompt = "You are Smart Study Buddy for college students. Explain '" + topic + "' simply. Mode: " + mode + ". Use simple analogies and bullet points.";
        sendGeminiRequest(prompt, callback);
    }

    public static void generateQuiz(String topic, int count, String difficulty, ApiCallback callback) {
        String prompt = "Create a " + count + "-question multiple choice quiz on '" + topic + "' (Difficulty: " + difficulty + "). Return JSON with keys: title, questions (array of: question, options [4], correctIndex [0-3], explanation).";
        sendGeminiRequest(prompt, callback);
    }

    public static void summarizeDocument(String content, ApiCallback callback) {
        String prompt = "Provide a high-yield study summary of this college material: \\n\\n" + content + "\\n\\nInclude: 1. Executive Summary, 2. Key Takeaway Bullets, 3. Crucial Definitions.";
        sendGeminiRequest(prompt, callback);
    }

    private static void sendGeminiRequest(String promptText, ApiCallback callback) {
        try {
            JSONObject root = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject contentObj = new JSONObject();
            JSONArray parts = new JSONArray();
            JSONObject partObj = new JSONObject();

            partObj.put("text", promptText);
            parts.put(partObj);
            contentObj.put("parts", parts);
            contents.put(contentObj);
            root.put("contents", contents);

            RequestBody body = RequestBody.create(
                    root.toString(),
                    MediaType.parse("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                    .url(GEMINI_URL)
                    .post(body)
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    callback.onFailure(e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        callback.onFailure("HTTP " + response.code() + ": " + response.message());
                        return;
                    }
                    try {
                        String respStr = response.body().string();
                        JSONObject json = new JSONObject(respStr);
                        String answer = json.getJSONArray("candidates")
                                .getJSONObject(0)
                                .getJSONObject("content")
                                .getJSONArray("parts")
                                .getJSONObject(0)
                                .getString("text");
                        callback.onSuccess(answer);
                    } catch (Exception e) {
                        callback.onFailure("Parse error: " + e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            callback.onFailure("Request prep failed: " + e.getMessage());
        }
    }
}`
  },
  {
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest declaring required Internet permission and all activities.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.smartstudybuddy.app">

    <!-- Free Internet Access for AI Tutor & Quiz Generator -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Smart Study Buddy"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmartStudyBuddy">

        <!-- Launcher Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".AITutorActivity"
            android:label="AI Tutor"
            android:parentActivityName=".MainActivity" />

        <activity
            android:name=".NotesActivity"
            android:label="My Notes"
            android:parentActivityName=".MainActivity" />

        <activity
            android:name=".QuizActivity"
            android:label="Practice Quiz"
            android:parentActivityName=".MainActivity" />

        <activity
            android:name=".StudyPlannerActivity"
            android:label="Study Planner"
            android:parentActivityName=".MainActivity" />

        <activity
            android:name=".PdfSummarizerActivity"
            android:label="PDF Summarizer"
            android:parentActivityName=".MainActivity" />

    </application>

</manifest>`
  },
  {
    filename: 'build.gradle',
    path: 'app/build.gradle',
    language: 'gradle',
    description: 'Module build.gradle file containing free, standard Google/Android dependencies.',
    code: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.smartstudybuddy.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.smartstudybuddy.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    // AndroidX & Material Design (Free official libraries)
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.cardview:cardview:1.0.0'

    // Free HTTP Client for Gemini AI API calls
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`
  },
  {
    filename: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'Clean, modern card-based Material 3 home screen layout.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F8FAFC"
    android:padding="16dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <!-- Header -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Smart Study Buddy"
            android:textSize="26sp"
            android:textStyle="bold"
            android:textColor="#0F172A" />

        <TextView
            android:id="@+id/tvWelcomeStatus"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Your AI-powered college study assistant"
            android:textSize="14sp"
            android:textColor="#64748B"
            android:layout_marginTop="4dp"
            android:layout_marginBottom="20dp" />

        <!-- Feature 1: AI Tutor -->
        <androidx.cardview.widget.CardView
            android:id="@+id/cardAiTutor"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:cardBackgroundColor="#FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="🤖 AI Simple Tutor"
                    android:textSize="18sp"
                    android:textStyle="bold"
                    android:textColor="#2563EB" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Simplifies difficult topics into simple analogies and clear steps."
                    android:textSize="13sp"
                    android:textColor="#475569"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </androidx.cardview.widget.CardView>

        <!-- Feature 2: Notes Section -->
        <androidx.cardview.widget.CardView
            android:id="@+id/cardNotes"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:cardBackgroundColor="#FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="📝 My Study Notes"
                    android:textSize="18sp"
                    android:textStyle="bold"
                    android:textColor="#059669" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Save, organize, and categorize revision notes locally (100% offline)."
                    android:textSize="13sp"
                    android:textColor="#475569"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </androidx.cardview.widget.CardView>

        <!-- Feature 3: Quiz Generator -->
        <androidx.cardview.widget.CardView
            android:id="@+id/cardQuiz"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:cardBackgroundColor="#FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="🎯 Practice Quiz Generator"
                    android:textSize="18sp"
                    android:textStyle="bold"
                    android:textColor="#7C3AED" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Generate multiple choice practice exams with instant answer feedback."
                    android:textSize="13sp"
                    android:textColor="#475569"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </androidx.cardview.widget.CardView>

        <!-- Feature 4: Study Planner -->
        <androidx.cardview.widget.CardView
            android:id="@+id/cardPlanner"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="12dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:cardBackgroundColor="#FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="📅 Exam Planner &amp; Focus Timer"
                    android:textSize="18sp"
                    android:textStyle="bold"
                    android:textColor="#D97706" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Track assignment deadlines and use the 25-minute Pomodoro timer."
                    android:textSize="13sp"
                    android:textColor="#475569"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </androidx.cardview.widget.CardView>

        <!-- Feature 5: PDF Summarizer -->
        <androidx.cardview.widget.CardView
            android:id="@+id/cardPdfSummarizer"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="16dp"
            app:cardCornerRadius="16dp"
            app:cardElevation="2dp"
            app:cardBackgroundColor="#FFFFFF">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="📄 PDF &amp; Document Summarizer"
                    android:textSize="18sp"
                    android:textStyle="bold"
                    android:textColor="#E11D48" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Paste long textbook pages or PDF text to get high-yield summaries."
                    android:textSize="13sp"
                    android:textColor="#475569"
                    android:layout_marginTop="4dp" />
            </LinearLayout>
        </androidx.cardview.widget.CardView>

    </LinearLayout>
</ScrollView>`
  }
];

export const STEP_BY_STEP_GUIDE = [
  {
    step: 1,
    title: 'Install Free Tools & Setup Environment',
    time: '15 mins',
    description: 'Everything needed to build this app is 100% free with no credit card required.',
    bullets: [
      'Download and install Android Studio (Official Google IDE, free for Windows/Mac/Linux) from developer.android.com/studio',
      'During installation, keep the default options checked (Android SDK, Android Virtual Device, and Platform-Tools).',
      'Java Development Kit (JDK 17) is bundled directly inside modern Android Studio, so no separate Java installation is necessary.',
      'Get a free Gemini API key from Google AI Studio (aistudio.google.com) to power the AI Tutor and Quiz generation.'
    ]
  },
  {
    step: 2,
    title: 'Create the Android Studio Project',
    time: '5 mins',
    description: 'Create a new Java-based Android project in Android Studio.',
    bullets: [
      'Open Android Studio and click "New Project".',
      'Select the "Empty Views Activity" template (very important: select "Empty Views Activity", not "Empty Activity" which is Jetpack Compose).',
      'Name: Smart Study Buddy',
      'Package name: com.smartstudybuddy.app',
      'Language: Java',
      'Minimum SDK: API 24 (Android 7.0) or API 26 (Android 8.0) - supports 95%+ of all active Android devices worldwide.',
      'Click Finish and let Gradle sync for 1-2 minutes.'
    ]
  },
  {
    step: 3,
    title: 'Add Dependencies in build.gradle',
    time: '3 mins',
    description: 'Add OkHttp for connecting to Gemini AI and Material Design for attractive UI components.',
    bullets: [
      'In Android Studio, open the Project file tree on the left: Gradle Scripts -> build.gradle (Module :app).',
      'Add implementation "com.squareup.okhttp3:okhttp:4.12.0" inside the dependencies { ... } block.',
      'Click the yellow "Sync Now" bar that appears at the top right of Android Studio.',
      'Open app/src/main/AndroidManifest.xml and add <uses-permission android:name="android.permission.INTERNET" /> right before <application>.'
    ]
  },
  {
    step: 4,
    title: 'Copy the Java Classes & Layout XMLs',
    time: '10 mins',
    description: 'Add the 5 main features: AI Tutor, SQLite Notes, Quiz Generator, Planner & PDF Summarizer.',
    bullets: [
      'Copy DatabaseHelper.java into app/src/main/java/com/smartstudybuddy/app/ (provides free local SQLite note storage).',
      'Copy GeminiApiClient.java and insert your free Gemini API key into the API_KEY string constant.',
      'Copy MainActivity.java, AITutorActivity.java, NotesActivity.java, QuizActivity.java, StudyPlannerActivity.java, and PdfSummarizerActivity.java.',
      'In app/src/main/res/layout/, create the corresponding XML layout files (or click "Download Full Project ZIP" below to get them pre-organized).'
    ]
  },
  {
    step: 5,
    title: 'Run on Your Phone or Virtual Emulator',
    time: '5 mins',
    description: 'Run the app either on an Android Virtual Device (AVD) or directly on your own physical smartphone.',
    bullets: [
      'Option A (Real Android Phone): On your Android phone, go to Settings -> About Phone -> tap "Build Number" 7 times to enable Developer Mode. Then in Developer Options, enable "USB Debugging". Plug your phone into your computer via USB.',
      'Option B (Virtual Emulator): In Android Studio, click Device Manager -> "Create Device" -> select Pixel 7 -> select latest system image (e.g., UpsideDownCake / Android 14) -> Finish.',
      'Select your device from the dropdown toolbar at the top of Android Studio and press the green "Run" play button (or Shift + F10).',
      'The app will compile, install onto your device, and launch the Smart Study Buddy home screen!'
    ]
  },
  {
    step: 6,
    title: 'Exporting APK to Share with College Classmates',
    time: '2 mins',
    description: 'Generate an installable .apk file you can send to friends via WhatsApp, Telegram, or Google Drive.',
    bullets: [
      'In Android Studio top menu, click Build -> Build Bundle(s) / APK(s) -> Build APK(s).',
      'Wait for Gradle to finish compiling (takes ~30 seconds).',
      'A notification "APK(s) generated successfully" will appear at the bottom right. Click "locate".',
      'You will see app-debug.apk! You can send this APK directly to any Android smartphone to install and test immediately.'
    ]
  }
];

export const FREE_TOOLS_RECOMMENDATION = [
  {
    name: 'Android Studio',
    cost: '100% Free',
    provider: 'Google',
    badge: 'Official IDE',
    description: 'The official integrated development environment for Android apps with visual layout editor, Java code assistance, and emulator.',
    link: 'https://developer.android.com/studio'
  },
  {
    name: 'Google AI Studio (Gemini Free Tier)',
    cost: 'Free Tier (60 req/min)',
    provider: 'Google',
    badge: 'AI Engine',
    description: 'Gives college students and developers free API keys to build generative AI features with no credit card required.',
    link: 'https://aistudio.google.com'
  },
  {
    name: 'Android SQLite Database',
    cost: '100% Free & Built-In',
    provider: 'Android OS',
    badge: 'Local DB',
    description: 'Native on-device database included in every Android phone. Stores student notes and study tasks completely offline with zero server costs.',
    link: 'https://developer.android.com/training/data-storage/sqlite'
  },
  {
    name: 'OkHttp / Volley',
    cost: 'Open Source (Apache 2.0)',
    provider: 'Square / Google',
    badge: 'Networking',
    description: 'Fast, reliable HTTP client for executing REST requests to AI endpoints with automatic retry and JSON parsing.',
    link: 'https://square.github.io/okhttp/'
  },
  {
    name: 'Material 3 Design Components',
    cost: 'Open Source',
    provider: 'Google',
    badge: 'UI System',
    description: 'Pre-built cards, floating action buttons, text fields, and color theming for modern student-friendly interfaces.',
    link: 'https://m3.material.io'
  }
];
