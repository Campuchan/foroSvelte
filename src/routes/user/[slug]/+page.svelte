<script lang="ts">
    export let data;
</script>

<h1>Perfil de Usuario</h1>

{#if data.user}
    <div class="profile-picture">
        <img src={"/images/"+data.user.username+".jpg"} alt="Imagen de perfil">
    </div>
    <p><strong>Nombre:</strong> {data.user.name}</p>
    <p><strong>Nombre de Usuario:</strong> {data.user.username}</p>
    <p><strong>Correo Electrónico:</strong> {data.user.email}</p>
{:else}
    <p>Usuario no encontrado.</p>
{/if}