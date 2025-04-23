<script lang="ts">
  import { onMount } from "svelte";
  import { user } from '$lib/auth';
  import CrearPost from '$lib/components/FormPost.svelte';

  let showPopup = false;
  let posts: { title: string; content: string }[] = [];
  let hayMas = false;
  let limit = 10;

  onMount(() => {
    fetchPosts(0);
  });

  function fetchPosts(skip: number) {
    fetch(`/api/posts?skip=${skip}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        posts = [...posts, ...data.posts];
        hayMas = data.hayMas;
        limit += 10; 
      })
      .catch(error => console.error('Error fetching posts:', error));
  }

  function openPopup() {
    showPopup = true;
  }
  function cargarMas() {
    fetchPosts(posts.length);
  }
</script>

<h1>Bienvenido al foro</h1>
{#if $user}
  <p>Bienvenido, {$user.name}!</p>
  <button on:click={openPopup}>Nuevo Post</button>
  <CrearPost visible={showPopup} close={() => showPopup = false} />
{:else}
  <p>No estás autenticado.</p>
{/if}

{#each posts as post}
  <div class="post">
    <h2>{post.title}</h2>
    <p>{post.content}</p>
  </div>
{/each}
{#if hayMas}
  <button on:click={cargarMas}>Cargar más</button>
{/if}