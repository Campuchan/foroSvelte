<script lang="ts">
    import { goto } from '$app/navigation';

    async function handleLogout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            if (response.ok) {
                // Redirect to home page after successful logout
                window.location.href = '/';
            } else {
                console.error('Error during logout');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }
</script>

<div class="logout-container">
    <h2>¿Estás seguro que quieres cerrar sesión?</h2>
    <button on:click={handleLogout}>Cerrar Sesión</button>
</div>

<style>
    .logout-container {
        text-align: center;
        margin-top: 2rem;
    }

    button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #c82333;
    }
</style>