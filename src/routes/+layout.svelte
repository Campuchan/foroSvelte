<script lang="ts">
    import { page } from '$app/state';
    import { user } from '$lib/auth';

    $: user.set(page.data.user || null);
</script>

<style>
    * {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .layout {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100vh;

        width: 100%;
    }

    header {
        position: relative;
        height: 120px;
        width: 100%;
        z-index: 1000;
        background-color: #333;
        color: white;
        padding: 10px 20px;
        text-align: center;

        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    header h1 a {
        color: white;
        margin: 0 auto;
        text-decoration: none;
        font-size: 48px;
        display: inline-block;
    }
    header h1 ::after {
        content : 'v0.2';
        font-size: 16px;
        color: #ccc;
    }

    nav {
        margin-top: 10px;
    }

    nav a {
        color: white;
        margin: 0 15px;
        text-decoration: none;
    }

    main {
        position: relative;
        flex-grow: 1;
        width: 100%; 
        padding: 20px;
        display: flex;
        justify-content: center; 
        align-items: center;
    }

    footer {
        height: 40px;
        text-align: center;
        padding: 10px 0;
        background-color: #333;
        color: white;
        width: 100%;
    }
</style>

<div class="layout">
    <header>
        <h1><a href="/">ForoSvelte</a></h1>
        <nav>
            {#if $user}
                <a href="/logout">Cerrar Sesión</a>
                <a href="/perfil">{$user.username}</a>
            {:else}
                <a href="/login">Iniciar Sesión</a>
                <a href="/registro">Registro</a>
            {/if}
        </nav>
    </header>

    <main>
        <slot />
    </main>

    <footer>Foro - Pablo Campuzano Cuadrado</footer>
</div>