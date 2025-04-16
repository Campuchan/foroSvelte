<script lang="ts">
    let username = '';
    let password = '';
    let message = '';
    let error = '';

    const handleSubmit = async (event: Event) => {
        event.preventDefault();
        message = '';
        error = '';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                message = 'Login successful!';
                // Store the token in localStorage or a cookie for future requests
                localStorage.setItem('token', data.token);
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
        <label for="username">Username:</label>
        <input id="username" type="text" bind:value={username} required />
    </div>
    <div>
        <label for="password">Contraseña:</label>
        <input id="password" type="password" bind:value={password} required />
    </div>
    <button type="submit">Login</button>
</form>

{#if message}
    <p style="color: green;">{message}</p>
{/if}

{#if error}
    <p style="color: red;">{error}</p>
{/if}