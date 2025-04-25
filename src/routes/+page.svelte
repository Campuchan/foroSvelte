<script lang="ts">
  import { onMount } from "svelte";
  import { user } from '$lib/auth';
  import CrearPost from '$lib/components/FormPost.svelte';

  let showPopup = false;
  let posts: { title: string; userId: string; content: string; createdAt: Date; }[] = [];
  let postAuthors = new Map<string, string>(); //userId, userName
  let hayMas = false;
  let limit = 10;

  onMount(() => {
    fetchPosts(0);
  });

  async function fetchPosts(skip: number) {
    await fetch(`/api/posts?skip=${skip}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        posts = [...posts, ...data.posts];
        posts.map(post => fetch(`/api/user/${post.userId}`)
          .then(response => response.json())
          .then(userData => {
            postAuthors.set(post.userId, userData.username);
            postAuthors = new Map(postAuthors);
          })
          .then(() => {
            console.log("posts", posts)
          })
          .catch(error => console.error('Error fetching user:', error))
        )
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
  .posts {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .posts p {
    font-size: 24px;
    color: #333;
  }
  .post {
    position: relative;
    display: flex;
    border: 1px solid #ccc;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 800px;
  }

  .post h2 {
    position: absolute;
    top: -18px;
    left: 2px;
    background-color: white;
    margin: 0;
  }
  .botonNuevoPost {
    z-index: 1000;
    position: absolute;
    top: 4px;
    left: 4px;
    background-color: #4CAF50; /* Verde */
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
<div class="posts">
  {#if $user}
    <!--<p>Bienvenido, {$user.name}!</p>-->
    <button class="botonNuevoPost" on:click={openPopup}>Nuevo Post</button>
    <CrearPost visible={showPopup} close={() => showPopup = false} />
  {:else}
    <p>No estás autenticado.</p>
  {/if}
  
  {#each posts as post}
    <div class="post">
      <h2>{post.title}</h2>
      <h3><a href="/user/{postAuthors.get(post.userId)}">{postAuthors.get(post.userId)}</a></h3>
      <p>{post.content}</p>
    </div>
  {/each}
  {#if hayMas}
    <button on:click={cargarMas}>Cargar más</button>
  {/if}
</div>