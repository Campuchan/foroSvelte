<script lang="ts">
  import { onMount } from "svelte";
  import { user } from '$lib/auth';
  import CrearPost from '$lib/components/FormPost.svelte';
  import { goto } from "$app/navigation";

  let showPopup = $state(false);
  let posts: { title: string; userId: string; content: string; createdAt: Date; }[] = $state([]);
  let postAuthors = $state(new Map<string, string>()); //userId, userName
  let hayMas = $state(false);
  let limit = 10;

  onMount(() => {
    fetchPosts(0);
  });

  async function fetchPosts(skip: number) {
    await fetch(`/api/posts?skip=${skip}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        posts = [...posts, ...data.posts];
        posts.map(post => {
          if (!postAuthors.has(post.userId)) { // si ya esta no fetchea
            fetch(`/api/user/${post.userId}`) // asigna el id del usuario a su nombre
              .then(response => response.json())
              .then(userData => {
                postAuthors.set(post.userId.toString(), userData.username); // .set no actualiza el dom
                postAuthors = new Map(postAuthors); // cuando se reasigna el mapa se actualiza en el dom
                console.log(postAuthors.get(post.userId.toString()));
              }) 
              .catch(error => console.error('Error fetching user:', error));
          }
        });
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

<style>
  .container {
    display: flex;
    flex-direction: row;
    width: 70%;
    min-width: 650px;
    height: 100%;
  }
  .aparte {
    min-width: 200px;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    border-right: 1px solid #ccc;
  }
  .posts {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }
  .post {
    position: relative;
    display: flex;
    border: 1px solid #ccc;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    width: 100%;
    user-select: none; 
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
  }
  .post:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
  }
  .post:active {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.6);
  }
  .post h2 {
    background-color: white;
    margin: 0;
    margin-left: 20px;
  }
  .post h3 {
    font-size: 12px;
    margin: 0;
    margin-right: 20px;
  }
  .botonNuevoPost {
    background-color: #4CAF50;
    color: white;
    width: 100%;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
<div class="container">
  <div class="aparte">
    {#if $user}
      <p>Bienvenido/a, {$user.name}!</p>
      <button class="botonNuevoPost" onclick={openPopup}>Nuevo Post</button>
      <CrearPost visible={showPopup} close={() => showPopup = false} />
    {:else}
      <p>No estás autenticado.</p>
    {/if}
  </div>
  <div class="posts">
    {#each posts as post} <!-- accesibilidad -->
      <div class="post" role="button" tabindex="0" 
        onclick={() => goto(`/post/${postAuthors.get(post.userId)}/${post.title}`)}
        onkeydown={(e) => e.key === 'Enter' && goto(`/post/${postAuthors.get(post.userId)}/${post.title}`)}>
        <h2>{post.title}</h2>
        <h3>
          publicado por <a href={`/user/${postAuthors.get(post.userId)}`}>{postAuthors.get(post.userId)}</a>
        </h3>
      </div>
    {/each}
    {#if hayMas}
      <button onclick={cargarMas}>Cargar más</button>
    {/if}
  </div>
</div>