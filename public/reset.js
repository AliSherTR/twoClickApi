
(function () {
    const qs = new URLSearchParams(location.search);
    const token = qs.get("token");

    const form = document.getElementById("form");
    const statusEl = document.getElementById("status");
    const doneEl = document.getElementById("done");

    if (!token) {
        statusEl.textContent = "Invalid reset link. Missing token.";
        form.classList.add("hidden");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        statusEl.textContent = "";

        const pwd = document.getElementById("password").value.trim();
        if (pwd.length < 8) {
            statusEl.textContent = "Password must be at least 8 characters.";
            return;
        }

        try {
            const res = await fetch("/api/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token, newPassword: pwd }),
            });

            if (!res.ok) {
                let msg = "Reset failed. The link may be expired.";
                try {
                    const data = await res.json();
                    if (data?.message) msg = data.message;
                } catch (_) { }
                statusEl.textContent = msg;
                return;
            }

            form.classList.add("hidden");
            doneEl.classList.remove("hidden");
        } catch (err) {
            statusEl.textContent = "Network error. Please try again.";
        }
    });
})();
