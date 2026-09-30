import type { Answer, Task, TrainingSet } from "./domain";
import { filterTasksByTopic, findTask, getProgress } from "./domain";

let failed = 0;

function check(name: string, condition: boolean): void {
  if (condition) {
    console.log(`   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}`);
  }
}

const tsTask: Task = {
  id: "ts-1",
  kind: "single-choice",
  topic: "typescript",
  prompt: "Что выведет этот JavaScript-код?",
  code: 'console.log("10" * 5);',
  options: [
    { id: "a", label: "105" },
    { id: "b", label: "50" },
    { id: "c", label: "Ошибка" },
  ],
};

const reactTask: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const mainSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [tsTask, reactTask],
};

const otherSet: TrainingSet = {
  id: "http-basics",
  title: "Основы HTTP",
  tasks: [
    {
      id: "http-1",
      kind: "short-text",
      topic: "http",
      prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
    },
  ],
};

const emptySet: TrainingSet = { id: "empty", title: "Пустой набор", tasks: [] };

const answerTs: Answer = { taskId: "ts-1", kind: "single-choice", optionId: "b" };
const answerReact: Answer = {
  taskId: "react-1",
  kind: "short-text",
  text: "Props приходят снаружи, состояние внутри компонента.",
};
const answerBlank: Answer = { taskId: "react-1", kind: "short-text", text: "   " };
const answerForeign: Answer = { taskId: "unknown", kind: "short-text", text: "текст" };

const answers: Answer[] = [answerTs, answerReact];
const reversedAnswers: Answer[] = [answerReact, answerTs];
const blankAnswers: Answer[] = [answerTs, answerBlank];
const foreignAnswers: Answer[] = [answerForeign];
const noAnswers: Answer[] = [];

const snapshot = () =>
  JSON.stringify([
    mainSet,
    otherSet,
    emptySet,
    answers,
    reversedAnswers,
    blankAnswers,
    foreignAnswers,
    noAnswers,
  ]);
const before = snapshot();

console.log("Поиск по id");
check("ts-1 найдено", findTask(mainSet.tasks, "ts-1")?.id === "ts-1");
check("react-1 найдено", findTask(mainSet.tasks, "react-1")?.id === "react-1");
check("у ts-1 сохранено поле code", findTask(mainSet.tasks, "ts-1")?.code === 'console.log("10" * 5);');
check("отсутствующий id -> undefined", findTask(mainSet.tasks, "nope") === undefined);
check("пустой id -> undefined", findTask(mainSet.tasks, "") === undefined);
check("пустой набор -> undefined", findTask(emptySet.tasks, "ts-1") === undefined);

console.log("Фильтр по теме");
check("есть совпадение", filterTasksByTopic(mainSet.tasks, "react").length === 1);
check("нет совпадений -> []", filterTasksByTopic(mainSet.tasks, "css").length === 0);
check("пустая тема -> []", filterTasksByTopic(mainSet.tasks, "").length === 0);
check("пустой набор -> []", filterTasksByTopic(emptySet.tasks, "react").length === 0);
check("другой набор", filterTasksByTopic(otherSet.tasks, "http").length === 1);

console.log("Прогресс");
const p0 = getProgress(mainSet.tasks, noAnswers);
const p1 = getProgress(mainSet.tasks, [answerTs]);
const p2 = getProgress(mainSet.tasks, answers);
const pReversed = getProgress(mainSet.tasks, reversedAnswers);
const pBlank = getProgress(mainSet.tasks, blankAnswers);
const pForeign = getProgress(mainSet.tasks, foreignAnswers);
const pOther = getProgress(otherSet.tasks, answers);
const pEmpty = getProgress(emptySet.tasks, answers);
const pEmptyNoAnswers = getProgress(emptySet.tasks, noAnswers);

check("нет ответов: 0 из 2", p0.filled === 0 && p0.total === 2);
check("один ответ: 1 из 2", p1.filled === 1 && p1.total === 2);
check("все ответы: 2 из 2", p2.filled === 2 && p2.total === 2);
check("порядок ответов не важен: 2 из 2", pReversed.filled === 2 && pReversed.total === 2);
check("пробелы не считаются: 1 из 2", pBlank.filled === 1 && pBlank.total === 2);
check("чужой taskId не считается: 0 из 2", pForeign.filled === 0 && pForeign.total === 2);
check("ответы другого набора не считаются: 0 из 1", pOther.filled === 0 && pOther.total === 1);
check("пустой набор с ответами: 0 из 0", pEmpty.filled === 0 && pEmpty.total === 0);
check("пустой набор без ответов: 0 из 0", pEmptyNoAnswers.filled === 0 && pEmptyNoAnswers.total === 0);

console.log("Входные данные не изменились");
check("наборы и ответы прежние", snapshot() === before);

if (failed > 0) {
  throw new Error(`Не пройдено проверок: ${failed}`);
}
console.log("Все проверки пройдены");