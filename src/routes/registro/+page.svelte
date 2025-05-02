<script lang="ts">
    import { goto } from "$app/navigation";
    import { user } from "$lib/auth";
    import { onMount } from "svelte";
    let username = $state("");
    let name = $state("");
    let email = $state("");
    let password = $state("");
    let message = $state("");
    let error = $state("");
    let loading = $state(false);
    let imagenPerfil: HTMLInputElement | null = $state(null);
    let imagePreview: string | null = $state(null);

    let errorContra = $state("");
    let errorEmail = $state("");
    
    onMount(() => {
        if ($user) {
            goto("/");
        }
    });

    function comprobarContrasena(contrasena: string) {
        if(contrasena.length < 4 || !contrasena.match(/[a-zA-Z]/) || !contrasena.match(/[0-9]/)) {
            errorContra = "La contraseña debe tener al menos 4 caracteres, un carácter y un numero.";
            return false;
        } else {
            errorContra = "";
            return true;
        }
    }

    function comprobarEmail(email: string) {
        if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            errorEmail = "El correo electrónico no es válido.";
            return false;
        } else {
            errorEmail = "";
            return true;
        }
    }

    async function handleSubmit(e : Event) {
        e.preventDefault();
        if (!comprobarContrasena(password) || !comprobarEmail(email)) {
            error = "Algunos campos no son válidos.";
            message = "";
            return;
        }
        try {
            loading = true;

            const formData = new FormData();
            formData.append("username", username);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            if (imagenPerfil?.files && imagenPerfil.files[0]) { // si existe el input y tiene un archivo
                formData.append("imagenPerfil", imagenPerfil.files[0]); // si no no manda nada y se asigna una por defecto
            }

            const response = await fetch("/api/registro", {
                method: "POST",
                /*headers: {
                    "Content-Type": "application/json",
                }, //forma de hacerlo sin imagen
                body: JSON.stringify({ username, name, email, password }),*/
                body: formData,
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
            error = "Error de conexión con el servidor. " + err;
            message = "";
            loading = false;
        }
    }

    function handleFileChange() {
        if (imagenPerfil?.files && imagenPerfil.files[0]) {
        imagePreview = URL.createObjectURL(imagenPerfil.files[0]);
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
        max-width: 400px;
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
        max-width: 220px;
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
    input[type="file"] {
        margin: 5px 0;
        background-color: white;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;

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
    .vistaPrevia {
        margin-top: 10px;
        max-width: 100%;
        max-height: 150px;
        object-fit: contain;
    }
</style>

<div class="container">
    <form onsubmit={(e) => { handleSubmit(e); }}>
        <h1>Registro</h1>
        <div>
            <label for="username">Nombre de usuario:</label>
            <input id="username" type="text" bind:value={username}
                onkeydown={() => {
                    username = username.toLowerCase();
                }}
                onblur={() => {
                    username = username.toLowerCase();
                }}
                required />
        </div>
        <div>
            <label for="name">Nombre:</label>
            <input id="name" type="text" bind:value={name} required />
        </div>
        <div>
            <label for="email">Correo electrónico:</label>
            <input id="email" type="email" bind:value={email}
            onkeydown={() => {
                comprobarEmail(email);
            }} onblur={() => {
                comprobarEmail(email);
            }} oninput={() => {
                comprobarEmail(email);
            }} required />
            {#if errorEmail}
                <p style="color: red;">{errorEmail}</p>
            {/if}
        </div>
        <div>
            <label for="password">Contraseña:</label>
            <input id="password" type="password" bind:value={password} 
            onkeydown={() => {
                comprobarContrasena(password);
            }} onblur={() => {
                comprobarContrasena(password);
            }} oninput={() => {
                comprobarContrasena(password);
            }} required />
            {#if errorContra}
                <p style="color: red;">{errorContra}</p>
            {/if}
        </div>
        <div>
            <label for="imagenPerfil">Imagen de perfil: (opcional)</label>
            <input
                id="imagenPerfil"
                type="file"
                accept="image/png, image/jpeg"
                bind:this={imagenPerfil}
                onchange={handleFileChange}
            />
            {#if imagePreview}
                <img class="vistaPrevia" src={imagePreview} alt="Vista previa"/>
            {/if}
        <button type="submit">Registrar</button>
    </form>
    <p>¿Ya tienes una cuenta? <a href="/login">Iniciar Sesión</a></p>
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