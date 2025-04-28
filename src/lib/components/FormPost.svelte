<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/auth";

  // Accept a prop to control visibility and a callback to close the popup.
  export let visible: boolean;
  //export function close(){}; esto no va
  export let close: () => {};
  
  let title = "";
  let content = "";
  let message = "";
  let error = "";
  let userId = $user?.username;


  async function handleSubmit(event: Event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      
      if (response.ok) {
        const data = await response.json();
        message = "Post creado exitosamente.";
        error = "";
        setTimeout(() => {
          goto(`/post/${userId}/${title}`);
        }, 1000);
      } else {
        const errorData = await response.json();
        error = errorData.message || "Ha habido un error al crear el post.";
        message = "";
      }
    } catch (err) {
      error = "Error de conexión con el servidor.";
      message = "";
    }
  }
</script>

{#if visible}
  <!-- comentarios para que no salte el aviso por falta de controles de teclado-->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click|self={close}>
    <div class="modal">
      <button class="close-button" on:click={close}>Ⅹ</button>
      <h2>Nuevo Post</h2>
      <form on:submit|preventDefault={handleSubmit}>
        <div>
          <label for="title">Título del Post:</label>
          <input id="title" type="text" bind:value={title} required />
        </div>
        <div>
          <label for="content">Contenido:</label>
          <textarea id="content" bind:value={content} required></textarea>
        </div>
        <button type="submit">Crear Post</button>
      </form>
      {#if message}
        <p class="success">{message}</p>
      {/if}
      {#if error}
        <p class="error">{error}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    position: relative;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  .close-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .success {
    color: green;
    margin-top: 1rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
</style>