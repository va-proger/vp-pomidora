export const storage = {
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;

            // Если это JSON — парсим
            if (raw.startsWith("{") || raw.startsWith("["))
                return JSON.parse(raw);

            // Иначе — возвращаем обычную строку
            return raw;

        } catch (e) {
            console.warn("storage.get error", e);
            return fallback;
        }
    },

    set(key, value) {
        try {
            if (typeof value === "object") {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.error("storage.set error", e);
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error("storage.remove error", e);
        }
    }
};
