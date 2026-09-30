export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: {
    id: string;
    label: string;
  }[];
};

export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  prompt: string;
  code?: string;
};

export type Task = SingleChoiceTask | ShortTextTask;

export type SingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

export type ShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

export function findTask(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

export function filterTasksByTopic(tasks: Task[], topic: string): Task[] {
  return tasks.filter((task) => task.topic === topic);
}

export function getProgress(
  tasks: Task[],
  answers: Answer[],
): { filled: number; total: number } {
  let filled = 0;

  for (const task of tasks) {
    const answer = answers.find((a) => a.taskId === task.id);

    if (!answer) {
      continue;
    }

    if (answer.kind === "short-text" && answer.text.trim() === "") {
      continue;
    }

    filled++;
  }

  return { filled, total: tasks.length };
}