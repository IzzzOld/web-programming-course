import { useState } from "react";
import type { Answer, Task } from "./domain";
import { mainSet } from "./training-data";
import "./App.css";

function isAnswerFilled(answer: Answer | undefined): boolean {
  if (!answer) {
    return false;
  }

  if (answer.kind === "short-text") {
    return answer.text.trim() !== "";
  }

  return answer.optionId !== "";
}

function getUnansweredTasks(tasks: Task[], answers: Answer[]): Task[] {
  return tasks.filter((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    return !isAnswerFilled(answer);
  });
}

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  onChoose: (id: string) => void;
};

function TaskList({ tasks, selectedTaskId, onChoose }: TaskListProps) {
  return (
    <nav className="task-list" aria-label="Список заданий">
      {tasks.map((task, index) => (
        <button
          key={task.id}
          type="button"
          className={
            task.id === selectedTaskId
              ? "task-button selected"
              : "task-button"
          }
          onClick={() => onChoose(task.id)}
        >
          <span className="task-number">{index + 1}</span>
          <span>{task.topic}</span>
        </button>
      ))}
    </nav>
  );
}

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onChoose: (taskId: string, optionId: string) => void;
  onText: (taskId: string, text: string) => void;
};

function TaskCard({ task, answer, onChoose, onText }: TaskCardProps) {
  const selectedOptionId =
    answer?.kind === "single-choice" ? answer.optionId : "";
  const text = answer?.kind === "short-text" ? answer.text : "";

  return (
    <article className="task-card">
      <div className="task-meta">
        <span className="topic">{task.topic}</span>
        <span className="task-kind">
          {task.kind === "single-choice"
            ? "Выбор ответа"
            : "Текстовое задание"}
        </span>
      </div>

      <h2>Условие задания</h2>
      <p>{task.prompt}</p>

      {task.code && (
        <pre className="code-block">
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset className="options">
          <legend>Варианты ответа</legend>
          {task.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={task.id}
                checked={selectedOptionId === option.id}
                onChange={() => onChoose(task.id, option.id)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="text-answer">
          <label htmlFor={"answer-" + task.id}>Ваш ответ</label>
          <textarea
            id={"answer-" + task.id}
            rows={5}
            value={text}
            onChange={(event) => onText(task.id, event.target.value)}
          />
        </div>
      )}
    </article>
  );
}

function Review({ tasks, answers }: { tasks: Task[]; answers: Answer[] }) {
  return (
    <section className="task-card">
      <h2>Обзор ответов</h2>
      <ol className="review-list">
        {tasks.map((task) => {
          const answer = answers.find((a) => a.taskId === task.id);
          let shown = "Нет ответа";

          if (answer?.kind === "single-choice" && task.kind === "single-choice") {
            const option = task.options.find((o) => o.id === answer.optionId);
            shown = option ? option.label : "Нет ответа";
          }

          if (answer?.kind === "short-text" && answer.text.trim() !== "") {
            shown = answer.text;
          }

          return (
            <li key={task.id}>
              <p className="review-prompt">{task.prompt}</p>
              <p className="review-answer">{shown}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function App() {
  const tasks = mainSet.tasks;

  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? "");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [status, setStatus] = useState<"in-progress" | "submitted">(
    "in-progress",
  );
  const [showWarning, setShowWarning] = useState(false);

  const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId);
  const selectedTask = tasks[selectedIndex];

  const unanswered = getUnansweredTasks(tasks, answers);
  const filledCount = tasks.length - unanswered.length;

  function saveChoice(taskId: string, optionId: string) {
    const newAnswer: Answer = { taskId, kind: "single-choice", optionId };
    setAnswers([...answers.filter((a) => a.taskId !== taskId), newAnswer]);
  }

  function saveText(taskId: string, text: string) {
    const newAnswer: Answer = { taskId, kind: "short-text", text };
    setAnswers([...answers.filter((a) => a.taskId !== taskId), newAnswer]);
  }

  function goPrev() {
    if (selectedIndex > 0) {
      setSelectedTaskId(tasks[selectedIndex - 1].id);
    }
  }

  function goNext() {
    if (selectedIndex < tasks.length - 1) {
      setSelectedTaskId(tasks[selectedIndex + 1].id);
    }
  }

  function finish() {
    if (unanswered.length > 0) {
      setShowWarning(true);
      return;
    }

    setStatus("submitted");
  }

  function confirmFinish() {
    setShowWarning(false);
    setStatus("submitted");
  }

  function startNewAttempt() {
    setAnswers([]);
    setShowWarning(false);
    setStatus("in-progress");
    setSelectedTaskId(tasks[0]?.id ?? "");
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>{mainSet.title}</h1>
        <p className="subtitle">Учебный модуль - {tasks.length} заданий</p>
      </header>

      {selectedTask ? (
        <div className="workspace">
          <section className="sidebar">
            <p className="section-label">Содержание модуля</p>
            <TaskList
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onChoose={setSelectedTaskId}
            />

            <div className="progress">
              <p>
                Заполнено: {filledCount} из {tasks.length}
              </p>
              {unanswered.length > 0 ? (
                <p>
                  Не заполнены:{" "}
                  {unanswered
                    .map((task) => "№" + (tasks.indexOf(task) + 1))
                    .join(", ")}
                </p>
              ) : (
                <p>Все задания заполнены</p>
              )}
            </div>
          </section>

          {status === "submitted" ? (
            <div>
              <Review tasks={tasks} answers={answers} />
              <div className="actions">
                <button
                  type="button"
                  className="action-button primary"
                  onClick={startNewAttempt}
                >
                  Начать новую попытку
                </button>
              </div>
            </div>
          ) : (
            <div>
              <TaskCard
                task={selectedTask}
                answer={answers.find((a) => a.taskId === selectedTask.id)}
                onChoose={saveChoice}
                onText={saveText}
              />
              <div className="actions">
                <button
                  type="button"
                  className="action-button"
                  onClick={goPrev}
                  disabled={selectedIndex === 0}
                >
                  Назад
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={goNext}
                  disabled={selectedIndex === tasks.length - 1}
                >
                  Далее
                </button>
                <button
                  type="button"
                  className="action-button finish"
                  onClick={finish}
                >
                  Завершить попытку
                </button>
              </div>

              {showWarning && unanswered.length > 0 && (
                <div className="warning" role="alert">
                  <p>
                    Не заполнены задания:{" "}
                    {unanswered
                      .map((task) => "№" + (tasks.indexOf(task) + 1))
                      .join(", ")}
                    . Завершить попытку?
                  </p>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setShowWarning(false)}
                  >
                    Вернуться к заданиям
                  </button>
                  <button
                    type="button"
                    className="action-button finish"
                    onClick={confirmFinish}
                  >
                    Всё равно завершить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <section className="empty-state">
          <h2>Задания отсутствуют</h2>
          <p>В этом учебном модуле пока нет заданий.</p>
        </section>
      )}
    </main>
  );
}