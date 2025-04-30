<script lang="ts">
    import { onMount } from 'svelte';
    import type { User } from '$lib/auth';
    
    let userData: User | null = $state(null);
    let errorMessage: string | null = $state(null);
    let loading: boolean = $state(true);
    let formUpdate = $state(false);
    let imagenPerfil: HTMLInputElement | null = $state(null);
    onMount(async () => {
        try {
            const res = await fetch('/api/user/auth', {
                method: 'GET',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                userData = data.user;
            } else {
                errorMessage = 'No se pudo obtener la información del usuario.';
            }
        } catch (err) {
            console.error('Error fetching user info:', err);
            errorMessage = 'Error al conectarse al servidor.';
        }
    });
  </script>
  <style>
    .container {
        height: 100%;
        width: 100%;
        display: block;
    }
    .perfil {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 12px;
      background-color: #f1f1f1;
      border: 1px solid #bbb;
      border-radius: 10px;
      max-width: 400px;
    }
    .perfil p {
        margin: 0;
        padding: 4px 0;
    }
    .imagen-perfil{
        height: 150px;
        width: 150px;
        border: 2px solid #333;
        border-radius: 8px;
    }
    .imagen-perfil img {
        width: 100%;
        height: auto;
    }
    
  </style>
  <div class="container">
    <div class="perfil">
      <h1>Perfil</h1>
      
      {#if errorMessage}
        <p style="color: red;">{errorMessage}</p>
      {:else if !userData}
        <p>Cargando...</p>
      {:else}
        {#if formUpdate}
          <form>
            <div>
              <label for="name">Nombre:</label>
              <input type="text" id="name" bind:value={userData.name} required>
            </div>
            <div>
              <label for="username">Nombre de Usuario:</label>
              <input type="text" id="username" bind:value={userData.username} required>
            </div>
            <div>
              <label for="email">Correo Electrónico:</label>
              <input type="email" id="email" bind:value={userData.email} required>
            </div>
            <div class="imagen-perfil">
              <img src={"/images/"+userData.username+".jpg"} alt="Imagen de perfil">
            </div>
            <div>
              <label for="imagenPerfil">Cambiar Imagen de Perfil:</label>
              <input type="file" id="imagenPerfil" accept="image/*" bind:this={imagenPerfil}>
            </div>
            <button type="submit">Actualizar</button>
          </form>
        {:else}
          <p><strong>Nombre:</strong> {userData.name}</p>
          <p><strong>Nombre de Usuario:</strong> {userData.username}</p>
          <div class="imagen-perfil">
            <img src={"/images/"+userData.username+".jpg"} alt="Imagen de perfil">
          </div>
          <p><strong>Correo Electrónico:</strong> {userData.email}</p>
        {/if}
        <button onclick="{() => { formUpdate = !formUpdate; }}">
          {#if formUpdate}
            Cancelar
          {:else}
            Editar
          {/if}
        </button>
      {/if}
    </div>
  </div>