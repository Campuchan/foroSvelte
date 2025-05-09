<script lang="ts">
  import { user } from '$lib/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Comentario from '$lib/components/Comentario.svelte';
  import { formatoDate } from '$lib/functions.js';
  
  export let data;
  
  let post = data.post;
  // let comentarios = data.comentarios.map((comentario) => {
  //   return {
  //     ...comentario,
  //     respuestaForm: false,
  //     contenidoRespuesta: ""
  //   };
  // });
  //console.log("POST: ", post)

  data.comentarios.forEach((comentario) => {
    comentario.respuestaForm = false;
    comentario.contenidoRespuesta = "";
  });
  
  let contenidoComentarioNuevo = "";
  let mensajeExito = "";
  let mensajeError = "";
  
  async function handleCommentSubmit(event: Event, parentId: string, contenidoComentario: string) {
    event.preventDefault();
    try {
      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: parentId || undefined,
          content: contenidoComentario,
          postId: post._id.toString()
        })
      });
  
      if (response.ok) {
        mensajeExito = "Comentario creado exitosamente.";
        mensajeError = "";
        contenidoComentarioNuevo = "";
        setTimeout(() => {
          data.comentarios = data.comentarios.map((comentario) => ({
            ...comentario,
            respuestaForm: false
          }));
          goto('', { invalidateAll: true, noScroll: true });
        }, 1000);
      } else {
        const errorData = await response.json();
        mensajeError = errorData.message || "Ha habido un error al crear el comentario.";
        contenidoComentarioNuevo = "";
      }
    } catch (err) {
      mensajeError = "Error de conexión con el servidor.";
      contenidoComentarioNuevo = "";
    }
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 70%;
    min-width: 650px;
    height: 100%;
  }
  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }
  h2 {
    margin: 0;
    margin-bottom: 16px;
    font-size: 1rem;
    font-weight: normal;
    color: grey;
  }
  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
    white-space: pre-wrap;
  }

  .post {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    background-color: #f9f9f9;
    margin-bottom: 16px;
  }

  h2 a {
    text-decoration: none;
    color: #007BFF;
  }
  #comentarios {
    margin-top: 16px;
    flex-grow: 1;
    padding: 16px;
    border: 1px solid #ccc;
    border-top: 1px solid #007BFF;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  .comentarioNuevo {
    resize: vertical;
  }
  .success {
    color: green;
  }
  .error {
    color: red;
  }
  .nuevo-comentario {
    margin-top: 16px;
  }
  textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 8px;
  }
  button {
    padding: 8px 16px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }

  @media (max-width: 768px) {
    .container {
      width: 100%;
      min-width: 0;
      padding: 10px;
      box-sizing: border-box;
    }
    h1 {
      font-size: 1.5rem;
    }
    h2 {
      font-size: 0.9rem; 
    }
    p {
      font-size: 0.9rem; 
    }
    #comentarios {
      padding: 10px;
      margin-top: 10px;
    }
    textarea {
      height: 80px;
    }
    button {
      padding: 6px 12px;
      font-size: 0.9rem;
    }
  }
</style>

<div class="container">
  <div class="post">
    <h1>{post.title}</h1>
    <h2>por <a href="/user/{post.username}">{post.username}</a> a las {formatoDate(post.createdAt)}</h2>
    <p>{post.content}</p>
  </div>
  
  <div id="comentarios">
    <h2>Comentarios</h2>
    {#if $user}
      <div class="nuevo-comentario">
        <form on:submit|preventDefault={(e) => handleCommentSubmit(e, "", contenidoComentarioNuevo)}>
          <textarea class="comentarioNuevo" bind:value={contenidoComentarioNuevo} placeholder="Escribe un comentario..." required></textarea>
          <button type="submit">Comentar</button>
        </form>
        {#if mensajeExito}
          <p class="success">{mensajeExito}</p>
        {/if}
        {#if mensajeError}
          <p class="error">{mensajeError}</p>
        {/if}
      </div>
    {/if}
    {#each data.comentarios as comentario (comentario._id)}
      <Comentario comentario={comentario} funcionComentar={handleCommentSubmit}/>
    {/each}
  </div>
</div>
