<script lang="ts">
    import { goto } from "$app/navigation";
    import { user } from "$lib/auth";
    import { onMount } from "svelte";
    let username = "";
    let name = "";
    let email = "";
    let password = "";
    let message = "";
    let error = "";
    let loading = false;

    onMount(() => {
        if ($user) {
            goto("/");
        }
    });

    async function handleSubmit() {
        try {
            loading = true;
            const response = await fetch("/api/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, name, email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                message = `Registro exitoso. Bienvenido, ${data.user.name}!`;
                error = "";
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                const errorData = await response.json();
                error = errorData.message || "Error al registrar usuario.";
                message = "";
            }
            loading = false;
        } catch (err) {
            error = "Error de conexión con el servidor.";
            message = "";
            loading = false;
        }
    }
</script>

<style>
    div {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
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

<div>
    <form on:submit|preventDefault={handleSubmit}>
        <h1>Registro</h1>
        <div>
            <label for="username">Nombre de usuario:</label>
            <input id="username" type="text" bind:value={username} required />
        </div>
        <div>
            <label for="name">Nombre:</label>
            <input id="name" type="text" bind:value={name} required />
        </div>
        <div>
            <label for="email">Correo electrónico:</label>
            <input id="email" type="email" bind:value={email} required />
        </div>
        <div>
            <label for="password">Contraseña:</label>
            <input id="password" type="password" bind:value={password} required />
        </div>
        <button type="submit">Registrar</button>
    </form>
</div>

{#if message}
    <p style="color: green;">{message}</p>
{/if}
{#if loading}
    <p style="color: blue;">Procesando...</p>
{/if}
{#if error}
    <p style="color: red;">{error}</p>
{/if}