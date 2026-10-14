import { useState } from "react";
import type { Task } from "./domain";
import { mainSet } from "./training-data";
import "./App.css";

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  onChoose: (id: string) => void;
};

function TaskList({
  tasks,
  selectedTaskId,
  onChoose,
}: TaskListProps) {
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

function TaskCard({ task }: { task: Task }) {
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
        <section className="options">
          <h3>Варианты ответа</h3>
          <ul>
            {task.options.map((option) => (
              <li key={option.id}>{option.label}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-task-note">
          Это задание предполагает текстовый ответ.
        </p>
      )}
    </article>
  );
}

export default function App() {
  const tasks = mainSet.tasks;

  const [selectedTaskId, setSelectedTaskId] = useState(
    tasks[0]?.id ?? "",
  );

  const selectedTask = tasks.find(
    (task) => task.id === selectedTaskId,
  );

  return (
    <main className="app">
      <header className="app-header">
        <h1>{mainSet.title}</h1>
        <p className="subtitle">
          Учебный модуль - {tasks.length} заданий
        </p>
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
          </section>

          <TaskCard task={selectedTask} />
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