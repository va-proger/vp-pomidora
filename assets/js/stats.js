import { storage } from "./storage.js";

let chartInstance = null;

export function registerPomodoro(durationMinutes = 0) {
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const stats = storage.get("stats", {});

    if (!stats[day]) {
        stats[day] = { pomodoros: 0, minutes: 0 };
    }

    stats[day].pomodoros += 1;
    stats[day].minutes += durationMinutes;

    storage.set("stats", stats);
}
const STATS_KEY = "pomodoro_stats";

export function loadStats() {
    return storage.get(STATS_KEY, {
        today: 0,
        week: {}
    });
}

export function saveStats(stats) {
    storage.set(STATS_KEY, stats);
}
export function clearStats() {
    storage.remove("stats");
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

export function initStatsChart() {
    const canvas = document.getElementById("statsChart");
    if (!canvas) return;

    const stats = storage.get("stats", {});
    const days = Object.keys(stats).sort();

    if (!days.length) {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        return;
    }

    const dataPomodoros = days.map(d => stats[d].pomodoros);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: days,
            datasets: [
                {
                    label: "Помидоров",
                    data: dataPomodoros,
                    borderColor: "#fb4b5c",
                    backgroundColor: "rgba(248,113,113,0.18)",
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: "#fee2e2"
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "#e5e7eb",
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#9ca3af", font: { size: 10 } },
                    grid: { color: "rgba(55,65,81,0.4)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#9ca3af", font: { size: 10 } },
                    grid: { color: "rgba(55,65,81,0.4)" }
                }
            }
        }
    });
}
