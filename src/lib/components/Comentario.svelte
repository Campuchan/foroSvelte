<script lang="ts">
  import Comentario from './Comentario.svelte';
  import { user } from '$lib/auth';

  export let comentario: {
    _id: string;
    content: string;
    username: string;
    timestamp: Date;
    respuestaFormVisible?: boolean;
    contenidoRespuesta?: string;
    respuestas: any[];
  };

  export let funcionComentar: (event: Event, parentId: string, contenidoComentario: string) => Promise<void>;

  function toggleReply() {
    comentario.respuestaFormVisible = !comentario.respuestaFormVisible;
  }
</script>

<div class="comentario">
  <p>{comentario.content}</p>
  <small>
    Publicado por <a href={"/user/" + comentario.username}>{comentario.username}</a> en {new Date(comentario.timestamp).toLocaleString()}
  </small>
  {#if $user}
    <button on:click={toggleReply}>
      {comentario.respuestaFormVisible ? "Cancelar" : "Responder"}
    </button>
  {/if}

  {#if comentario.respuestaFormVisible}
    <div class="inline-comentario-form">
      <form on:submit|preventDefault={event => funcionComentar(event, comentario._id, comentario.contenidoRespuesta ?? "")}> 
        <!-- si contenidoRespuesta no existe lo pone vacio,
         typescript es un poco tonto a veces-->
        <textarea class="comentarioNuevo" bind:value={comentario.contenidoRespuesta} placeholder="Escribe tu respuesta..." required></textarea>
        <button type="submit">Responder</button>
      </form>
    </div>
  {/if}

  {#if comentario.respuestas && comentario.respuestas.length > 0}
    <div class="respuestas">
      {#each comentario.respuestas as subComentario (subComentario._id)}
        <Comentario comentario={subComentario} funcionComentar={funcionComentar}></Comentario>
      {/each}
    </div>
  {/if}
</div>

<style>
  .comentario {
    border: 1px solid #ccc;
    padding: 8px;
    margin: 8px 0;
  }
  .comentario p {
    margin: 0;
    white-space: pre-wrap;
  }
  .comentario a {
    text-decoration: none;
    color: #007BFF;
  }
  .respuestas {
    margin-top: 8px;
    padding-left: 16px;
    border-left: 2px solid #ddd;
  }
  .inline-comentario-form {
    margin-top: 8px;
  }
  .comentarioNuevo {
    resize: vertical;
  }
  textarea {
    width: 100%;
    height: 80px;
    margin-bottom: 8px;
  }
  button {
    padding: 4px 8px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
</style>