<script lang="ts">
    import { page } from '$app/state';
    import { user } from '$lib/auth';
  import FotoFlotante from '$lib/components/fotoFlotante.svelte';

    $: user.set(page.data.user || null);
</script>

<style>
    * {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
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
        height: 55px;
        min-height: 55px;
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
        content : 'v1.0';
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
        padding-top: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center; 
        align-items: center;
        overflow-x: hidden;
    }

    footer {
        height: 40px;
        text-align: center;
        padding: 10px 0;
        background-color: #333;
        color: white;
        width: 100%;
    }

    @media (max-width: 768px) {
        header {
            flex-direction: column;
            height: auto;
            padding: 10px;
        }

        header h1 a {
            font-size: 32px;
        }

        nav {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }

        nav a {
            margin: 5px;
            font-size: 14px;
        }

        main {
            padding: 10px;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
        }

        footer {
            font-size: 12px;
            padding: 5px 0;
        }
    }
</style>

<div class="layout">
    <header>
        <h1><a href="/">ForoSvelte</a></h1>
        <nav>
            {#if $user}
                <a href="/chat">Chat</a>
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
<FotoFlotante/> <!--cosa guay-->