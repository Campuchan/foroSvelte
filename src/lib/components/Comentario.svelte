<script lang="ts">
  import Comentario from './Comentario.svelte';

  export let comentario: {
    _id: string;
    content: string;
    username: string;
    timestamp: Date;
    respuestaForm?: boolean;
    contenidoRespuesta?: string;
    respuestas: any[];
  };

  export let funcionComentar: (event: Event, parentId: string, contenidoComentario: string) => Promise<void>;


  function toggleReply() {
    comentario.respuestaForm = !comentario.respuestaForm;
  }
</script>

<div class="comentario">
  <p>{comentario.content}</p>
  <small>
    Publicado por <a href={"/user/" + comentario.username}>{comentario.username}</a> en {new Date(comentario.timestamp).toLocaleString()}
  </small>
  {#if comentario.respuestaForm !== undefined}
    <button on:click={toggleReply}>
      {comentario.respuestaForm ? "Cancelar" : "Responder"}
    </button>
  {/if}

  {#if comentario.respuestaForm}
    <div class="inline-comentario-form">
      <form on:submit|preventDefault={event => funcionComentar(event, comentario._id, comentario.contenidoRespuesta ?? "")}> 
        <!-- si contenidoRespuesta no existe lo pone vacio,
         typescript es un poco tonto a veces-->
        <textarea bind:value={comentario.contenidoRespuesta} placeholder="Escribe tu respuesta..." required></textarea>
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
  .respuestas {
    margin-top: 8px;
    padding-left: 16px;
    border-left: 2px solid #ddd;
  }
  .inline-comentario-form {
    margin-top: 8px;
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