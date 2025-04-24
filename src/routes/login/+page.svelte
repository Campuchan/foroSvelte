<script lang="ts">
    import { user } from "$lib/auth";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";    
    
    let username = "";
    let password = "";
    let message = "";
    let error = "";

    onMount(() => {
        if ($user) {
            goto("/");
        }
    });

    async function handleSubmit() {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                message = `Inicio de sesión exitoso. Bienvenido/a, ${data.user.name}!`;
                error = "";
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                const errorData = await response.json();
                error = errorData.message || "Error al iniciar sesión.";
                message = "";
            }
        } catch (err) {
            error = "Error de conexión con el servidor.";
            message = "";
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div>
        <label for="username">Nombre de usuario:</label>
        <input id="username" type="text" bind:value={username} required />
    </div>
    <div>
        <label for="password">Contraseña:</label>
        <input id="password" type="password" bind:value={password} required />
    </div>
    <button type="submit">Iniciar Sesión</button>
</form>

{#if message}
    <p style="color: green;">{message}</p>
{/if}

{#if error}
    <p style="color: red;">{error}</p>
{/if}