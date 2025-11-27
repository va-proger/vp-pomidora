import { storage } from "./storage.js";

export function initTheme() {
    const btn = document.getElementById("themeToggle");
    const saved = storage.get("theme", "dark");

    if (saved === "light") {
        document.body.classList.add("light");
    }

    updateLabel();

    btn.addEventListener("click", () => {
        document.body.classList.toggle("light");
        const current = document.body.classList.contains("light") ? "light" : "dark";
        storage.set("theme", current);
        updateLabel();
    });

    function updateLabel() {
        const light = document.body.classList.contains("light");
        btn.textContent = light ? "☀️ Светлая" : "🌙 Тёмная";
    }
}
