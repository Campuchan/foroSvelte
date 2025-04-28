<script lang="ts">
    import { onMount } from 'svelte';
    import type { User } from '$lib/auth';
    
    let userData: User | null = $state(null);
    let errorMessage: string | null = $state(null);
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
  <div>
    <h1>Perfil del Usuario</h1>
    
    {#if errorMessage}
      <p style="color: red;">{errorMessage}</p>
    {:else if !userData}
      <p>Cargando...</p>
    {:else}
      <p><strong>Nombre:</strong> {userData.name}</p>
      <p><strong>Correo Electrónico:</strong> {userData.email}</p>
      <p><strong>Nombre de Usuario:</strong> {userData.username}</p>
    {/if}
  </div>