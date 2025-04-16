<script lang="ts">
    let username = '';
    let name = '';
    let email = '';
    let password = '';
    let message = '';
    let error = '';

    const handleSubmit = async (event : Event) => { //Event es para que VsCode no marque error
        event.preventDefault();
        message = '';
        error = '';

        try {
            const response = await fetch('/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                message = data.message;
            } else {
                error = data.error || 'An error occurred';
            }
        } catch (err) {
            error = 'Failed to connect to the server';
        }
    };
</script>

<form on:submit|preventDefault={handleSubmit}>
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

{#if message}
    <p style="color: green;">{message}</p>
{/if}

{#if error}
    <p style="color: red;">{error}</p>
{/if}