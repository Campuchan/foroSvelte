<script lang="ts">
    import { onMount } from 'svelte';
    import type { User } from '$lib/auth';
    import { user } from '$lib/auth';
  import { goto } from '$app/navigation';

    
    let userData: User | null = $state(null);
    let errorMessage: string | null = $state(null);
    let loading: boolean = $state(true);
    let formUpdate = $state(false);
    let emailUpdate: string | null = $state(null);
    let nameUpdate: string | null = $state(null);
    let imagePreview: string | null = $state(null);
    let imagenUpdate: HTMLInputElement | null = $state(null);
    let message: string | null = $state(null);

    if(!$user) {
        goto('/login');
    }

    onMount(async () => {
        try {
            const res = await fetch('/api/user/auth', {
                method: 'GET',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                userData = data.user;
                nameUpdate = userData?.name ?? null
                emailUpdate = userData?.email ?? null
              } else {
                errorMessage = 'No se pudo obtener la información del usuario.';
            }
        } catch (err) {
            console.error('Error fetching user info:', err);
            errorMessage = 'Error al conectarse al servidor.';
        }
    });
  

  function handleUpdateSubmit(e: Event): void {
    e.preventDefault();
    if (!emailUpdate || !nameUpdate) {
        errorMessage = 'Por favor, completa todos los campos.';
        return;
    }
    let oldemail = $user?.email ?? ''; //no se me ocurre manera en la que $user sea null
    let oldname = $user?.name ?? '';

    const formData = new FormData();
    formData.append('email', emailUpdate);
    formData.append('name', nameUpdate);
    formData.append('oldemail', oldemail ); 
    formData.append('oldname', oldname);
    formData.append('username', $user?.username ?? '');
    if (imagenUpdate?.files && imagenUpdate.files[0]) {
        formData.append('imagenPerfil', imagenUpdate.files[0]);
    }
    
    fetch('/api/user', {
        method: 'PUT',
        body: formData,
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            errorMessage = data.error;
        } else {
            message = 'Perfil actualizado exitosamente.';
            setTimeout(() => {
              window.location.href = '/perfil';
            }, 2000);
        }
    })
    .catch(err => {
        console.error('Error updating user:', err);
        errorMessage = 'Error al actualizar el perfil.';
    });
  }
</script>
  <style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
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
    
    .perfil > * {
        margin-bottom: 12px;
    }

    form > div {
        margin-bottom: 12px;
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
          <form onsubmit={(e) => handleUpdateSubmit(e)}>
            <div>
              <label for="name">Nombre:</label>
              <input type="text" id="name" bind:value={nameUpdate} required>
            </div>
            <div>
              <p><strong>Nombre de Usuario:</strong> {userData.username} (no se puede cambiar)</p>
            </div>
            <div>
              <label for="email">Correo Electrónico:</label>
              <input type="email" id="email" bind:value={emailUpdate} required>
            </div>
            <div class="imagen-perfil">
              <img src={imagePreview} alt="Imagen de perfil">
            </div>
            <div>
              <label for="imagenPerfil">Cambiar Imagen de Perfil:</label>
              <input type="file" id="imagenPerfil" accept="image/*" bind:this={imagenUpdate} onchange={() => {
                if (imagenUpdate?.files && imagenUpdate.files[0]) {
                  imagePreview = URL.createObjectURL(imagenUpdate.files[0]);
                }
              }}>
            </div>
            <button type="submit">Actualizar</button>
            {#if message}
              <p style="color: green;">{message}</p>
            {/if}
          </form>
        {:else}
          <p><strong>Nombre:</strong> {userData.name}</p>
          <p><strong>Nombre de Usuario:</strong> {userData.username}</p>
          <p><strong>Correo Electrónico:</strong> {userData.email}</p>
          <div class="imagen-perfil">
            <img src={"/images/"+userData.username+".jpg"} alt="Imagen de perfil">
          </div>
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