import { storage } from "./storage.js";

export class Tasks {
    constructor(listEl) {
        this.listEl = listEl;
        this.tasks = storage.get("tasks", []);
        this.render();
    }

    addTask(title) {
        if (!title.trim()) return;

        this.tasks.push({
            id: Date.now(),
            title: title.trim(),
            done: false,
            pomodoros: 0
        });
        this.save();
    }

    toggle(id) {
        const t = this.tasks.find(t => t.id === id);
        if (!t) return;
        t.done = !t.done;
        this.save();
    }

    remove(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    }

    addPomodoroToFirstActive() {
        const t = this.tasks.find(t => !t.done);
        if (!t) return;
        t.pomodoros++;
        this.save();
    }

    save() {
        storage.set("tasks", this.tasks);
        this.render();
    }

    render() {
        if (!this.tasks.length) {
            this.listEl.innerHTML = `<p class="text-xs text-muted">Пока нет задач. Добавь хотя бы одну 👇</p>`;
            return;
        }

        this.listEl.innerHTML = this.tasks
            .map(t => {
                return `
<div class="task-row">
  <div class="task-main">
    <input type="checkbox" data-id="${t.id}" class="h-4 w-4">
    <span class="task-title ${t.done ? "done" : ""}">
      ${escapeHtml(t.title)}
    </span>
  </div>
  <div class="flex items-center gap-2">
    <span class="task-meta">🍅 ${t.pomodoros}</span>
    <button class="task-remove" data-remove="${t.id}" type="button">×</button>
  </div>
</div>
`;
            })
            .join("");
    }
}

function escapeHtml(str) {
    str = String(str || ""); // нормализуем
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}