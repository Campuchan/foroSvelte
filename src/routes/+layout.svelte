<script lang="ts">
    import { page } from '$app/state';
    import { user } from '$lib/auth';

    $: user.set(page.data?.user || null);
</script>

<style>
    * {
        font-family: Arial, sans-serif;
    }

    header {
        position: fixed;
        top: 0;
        left: 0;
        height: 120px;
        width: 100%;
        z-index: 1000;
        background-color: #333;
        color: white;
        padding: 10px 20px;
        text-align: center;
    }

    header h1 a {
        color: white;
        margin: 0;
        text-decoration: none;
        font-size: 48px;
    }

    nav a {
        color: white;
        margin: 0 15px;
        text-decoration: none;
    }

    main {
        margin-top: 120px; /* segun header y footer */
        margin-bottom: 40px;
        padding: 20px;
    }

    footer {
        height: 40px;
        text-align: center;
        padding: 10px 0;
        background-color: #333;
        color: white;
        position: fixed;
        width: 100%;
        bottom: 0;
    }
</style>

<header>
    <h1><a href="/">Foro</a></h1>
    <nav>
        {#if $user}
            <a href="/logout">Cerrar Sesión</a>
            <a href="/perfil">Perfil</a>
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