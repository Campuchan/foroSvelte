<script lang="ts">
    export let data;
</script>
<style>
    .imagen-perfil{
        height: 150px;
        width: 150px;
        border: 2px solid #333;
        border-radius: 8px;
    }
</style>
<h1>Perfil de Usuario</h1>

{#if data.user}
    <img src={"/images/"+data.user.username+".jpg"} class="imagen-perfil" alt="Imagen de perfil">
    <p><strong>Nombre:</strong> {data.user.name}</p>
    <p><strong>Nombre de Usuario:</strong> {data.user.username}</p>
    <p><strong>Correo Electrónico:</strong> {data.user.email}</p>
{:else}
    <p>Usuario no encontrado.</p>
{/if}