import { storage } from "./storage.js";

export class Timer {
    constructor(displayEl, ringEl, sessionLabelEl, modeLabelEl, cycleLabelEl, onSessionEnd) {
        this.displayEl = displayEl;
        this.ringEl = ringEl;
        this.sessionLabelEl = sessionLabelEl;
        this.modeLabelEl = modeLabelEl;
        this.cycleLabelEl = cycleLabelEl;
        this.onSessionEnd = onSessionEnd;

        this.intervalId = null;
        this.loadSettings();
        this.mode = "work"; // work | break | long
        this.cycle = 1;
        this.remaining = this.settings.work * 60;

        this.updateUI();
    }

    loadSettings() {
        const defaults = {
            work: 25,
            break: 5,
            longBreak: 15,
            cycles: 4
        };
        this.settings = { ...defaults, ...storage.get("settings", {}) };
    }

    applySettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        storage.set("settings", this.settings);
        this.reset(false);
    }

    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    pause() {
        if (!this.intervalId) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    reset(stop = true) {
        if (stop) {
            this.pause();
        }
        this.mode = "work";
        this.cycle = 1;
        this.remaining = this.settings.work * 60;
        this.updateUI();
    }

    tick() {
        this.remaining--;
        if (this.remaining <= 0) {
            // завершение сессии
            const durationMinutes = this.getCurrentDurationMinutes();
            const prevMode = this.mode;
            this.nextMode();
            this.onSessionEnd?.(prevMode, durationMinutes);
        }
        this.updateUI();
    }

    getCurrentDurationMinutes() {
        if (this.mode === "work") return this.settings.work;
        if (this.mode === "break") return this.settings.break;
        if (this.mode === "long") return this.settings.longBreak;
        return 0;
    }

    nextMode() {
        if (this.mode === "work") {
            if (this.cycle % this.settings.cycles === 0) {
                this.mode = "long";
            } else {
                this.mode = "break";
            }
        } else {
            // из break/long всегда возвращаемся в work
            this.mode = "work";
            if (this.mode === "work") {
                // если только что был long, считаем новый цикл
                this.cycle++;
            }
        }

        if (this.mode === "work") {
            this.remaining = this.settings.work * 60;
        } else if (this.mode === "break") {
            this.remaining = this.settings.break * 60;
        } else {
            this.remaining = this.settings.longBreak * 60;
        }
    }

    updateUI() {
        // время
        const m = String(Math.floor(this.remaining / 60)).padStart(2, "0");
        const s = String(this.remaining % 60).padStart(2, "0");
        this.displayEl.textContent = `${m}:${s}`;

        // лейблы
        let modeRu = "";
        if (this.mode === "work") modeRu = "Работа";
        if (this.mode === "break") modeRu = "Перерыв";
        if (this.mode === "long") modeRu = "Длинный перерыв";

        this.modeLabelEl.textContent = modeRu;

        this.sessionLabelEl.textContent =
            (this.mode === "work" ? "Work" : this.mode === "break" ? "Break" : "Long break") +
            ` · Помидор #${this.cycle}`;

        this.cycleLabelEl.textContent = `${this.cycle} / ${this.settings.cycles}`;

        // круг
        const total =
            this.mode === "work"
                ? this.settings.work * 60
                : this.mode === "break"
                    ? this.settings.break * 60
                    : this.settings.longBreak * 60;

        const circumference = 691;
        const progress = circumference * (1 - this.remaining / total);
        this.ringEl.style.strokeDashoffset = circumference - progress;
    }
}
