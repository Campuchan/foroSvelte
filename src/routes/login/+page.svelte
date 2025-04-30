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
<style>
    .container {
        margin: 0;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #f1f1f1;
        border: 1px solid #bbb;
        border-radius: 10px;
    }

    form {
        display: flex;
        flex-direction: column;
    }

    h1 {
        margin-top: 0;        
    }

    form div {
        display: flex;
        flex-direction: column;
    }
    form div label {
        align-self: flex-start;
    }
    
    input[type="text"],
    input[type="email"],
    input[type="password"] {
        margin: 5px 0;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4x;
    }
    button[type="submit"] {
        margin-top: 10px;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
<div class="container">
    <form on:submit|preventDefault={handleSubmit}>
        <h1>Iniciar Sesión</h1>
        <div>
            <label for="username">Nombre de usuario:</label>
            <input id="username" type="text" bind:value={username}
                on:keydown={() => {
                    username = username.toLowerCase().trim();
                }} 
                on:blur={() => {
                    username = username.toLowerCase().trim();
                }}
                required />
        </div>
        <div>
            <label for="password">Contraseña:</label>
            <input id="password" type="password" bind:value={password} required />
        </div>
        <button type="submit">Iniciar Sesión</button>
    </form>
    <p>¿No tienes una cuenta? <a href="/registro">Registrarse</a></p>
</div>

{#if message}
    <p style="color: green;">{message}</p>
{/if}

{#if error}
    <p style="color: red;">{error}</p>
{/if}