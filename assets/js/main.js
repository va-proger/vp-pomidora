import { initTheme } from "./theme.js";
import { Timer } from "./timer.js";
import { Tasks } from "./tasks.js";
import { initStatsChart, registerPomodoro, clearStats } from "./stats.js";
import { fireConfetti } from "./confetti.js";
import { storage } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const displayEl = document.getElementById("timerDisplay");
    const ringEl = document.getElementById("progressRing");
    const sessionLabelEl = document.getElementById("sessionLabel");
    const modeLabelEl = document.getElementById("modeLabel");
    const cycleLabelEl = document.getElementById("cycleLabel");
    const ding = document.getElementById("ding");

    const taskListEl = document.getElementById("taskList");
    const tasks = new Tasks(taskListEl);

    const timer = new Timer(
        displayEl,
        ringEl,
        sessionLabelEl,
        modeLabelEl,
        cycleLabelEl,
        (prevMode, minutes) => {
            if (prevMode === "work") {
                registerPomodoro(minutes);
                tasks.addPomodoroToFirstActive();
                initStatsChart();
                // звук
                if (ding) {
                    ding.currentTime = 0;
                    ding.play().catch(() => {});
                }
                fireConfetti();
            }
        }
    );

    // кнопки таймера
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");

    startBtn.addEventListener("click", () => {
        timer.start();
        markActiveButton("startBtn");
    });

    pauseBtn.addEventListener("click", () => {
        timer.pause();
        markActiveButton("pauseBtn");
    });

    resetBtn.addEventListener("click", () => {
        timer.reset();
        markActiveButton(null);
    });

    function markActiveButton(id) {
        [startBtn, pauseBtn, resetBtn].forEach(btn => {
            btn.classList.remove("ring-2", "ring-accent");
        });
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.classList.add("ring-2", "ring-accent");
    }

    // настройки
    const setWork = document.getElementById("setWork");
    const setBreak = document.getElementById("setBreak");
    const setLongBreak = document.getElementById("setLongBreak");
    const setCycles = document.getElementById("setCycles");
    const saveSettingsBtn = document.getElementById("saveSettings");

    // заполнить текущими настройками
    const settings = storage.get("settings", {});
    if (settings.work) setWork.value = settings.work;
    if (settings.break) setBreak.value = settings.break;
    if (settings.longBreak) setLongBreak.value = settings.longBreak;
    if (settings.cycles) setCycles.value = settings.cycles;

    saveSettingsBtn.addEventListener("click", () => {
        const newSettings = {
            work: clampNumber(setWork.value, 1, 180, 25),
            break: clampNumber(setBreak.value, 1, 60, 5),
            longBreak: clampNumber(setLongBreak.value, 1, 60, 15),
            cycles: clampNumber(setCycles.value, 1, 10, 4)
        };
        timer.applySettings(newSettings);
        // лёгкий визуальный отклик
        saveSettingsBtn.textContent = "Сохранено ✓";
        setTimeout(() => (saveSettingsBtn.textContent = "Сохранить настройки"), 1200);
    });

    function clampNumber(value, min, max, fallback) {
        const n = Number(value);
        if (Number.isNaN(n)) return fallback;
        return Math.min(max, Math.max(min, n));
    }

    // задачи
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTask");

    addTaskBtn.addEventListener("click", () => {
        const val = taskInput.value.trim();
        if (!val) return;
        tasks.addTask(val);
        taskInput.value = "";
        taskInput.focus();
    });

    taskInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            addTaskBtn.click();
        }
    });

    taskListEl.addEventListener("change", e => {
        const id = Number(e.target.dataset.id);
        if (!id) return;
        tasks.toggle(id);
    });

    taskListEl.addEventListener("click", e => {
        const btn = e.target.closest("[data-remove]");
        if (!btn) return;
        const id = Number(btn.dataset.remove);
        if (!id) return;
        tasks.remove(id);
    });

    // статистика
    initStatsChart();

    const clearStatsBtn = document.getElementById("clearStats");
    clearStatsBtn.addEventListener("click", () => {
        clearStats();
        initStatsChart();
    });
});
// SHARE WIDGET -------------------------
document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("shareToggle");
    const panel = document.getElementById("sharePanel");

    toggle.addEventListener("click", () => {
        panel.classList.toggle("active");
    });

    const url   = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    const shareLinks = {
        vk:      `https://vk.com/share.php?url=${url}&title=${title}`,
        telegram:`https://t.me/share/url?url=${url}&text=${title}`,
        whatsapp:`https://wa.me/?text=${title}%20${url}`,
        facebook:`https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        email:   `mailto:?subject=${title}&body=${url}`
    };

    panel.querySelectorAll("[data-share]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const type = el.dataset.share;
            const link = shareLinks[type];
            window.open(link, "_blank", "width=600,height=500");
        });
    });
});
