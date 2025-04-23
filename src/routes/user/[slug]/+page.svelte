<script lang="ts">
    export let data;
</script>

<h1>Perfil de Usuario</h1>

{#if data.user}
    <p><strong>Nombre:</strong> {data.user.name}</p>
    <p><strong>Correo Electrónico:</strong> {data.user.email}</p>
    <p><strong>Nombre de Usuario:</strong> {data.user.username}</p>
{:else}
    <p>Usuario no encontrado.</p>
{/if}