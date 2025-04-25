<script lang="ts">
    import { onMount } from 'svelte';
    import { user } from '$lib/auth';

    export let data;
    const post = data.post;
    const comentarios = data.comentarios;

    let contenidoComentario = '';


    function enviarComentario(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
        event.preventDefault();
        
    }
</script>
<style>
    .container {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
<div class="container">
    <h1>{post.title}</h1>
    <h2>por <a href="/user/{post.username}">{post.username}</a></h2>
    <p>{post.content}</p>
    <div id="comentarios">
        <h2>Comentarios</h2>
        {#each comentarios as comentario}
            <div class="comentario">
                <p>{comentario.content}</p>
                <small>Publicado por {comentario.userId} en {new Date(comentario.timestamp).toLocaleString()}</small>
            </div>
        {/each}
        {#if $user}
            <div class="nuevo-comentario">
                <textarea placeholder="Escribe un comentario..." bind:value={contenidoComentario}></textarea>
                <button on:click={enviarComentario}>Enviar</button>
            </div>
        {/if}
    </div>
</div>

