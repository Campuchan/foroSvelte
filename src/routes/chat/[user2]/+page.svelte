<script lang="ts">
  import { onMount } from 'svelte';
  import { io } from 'socket.io-client';
  import { user } from '$lib/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  export let data: { user2: { id: string; name: string; email: string; username: string } };

  let socket: any;
  let privateMessages: { from: string; content: string; timestamp: string }[] = [];
  let newPrivateMessage = "";
  let roomId = "";
  
  const currentUser = get(user);
  const user2Id = data.user2.id;  

  function generateRoomId(userA: string, userB: string): string {
    return [userA, userB].sort().join('-');
  }
  
  onMount(() => {
    if (!currentUser) {
      goto('/?error=El usuario no está autenticado');
      return;
    }
    roomId = generateRoomId(currentUser.id, user2Id);
    socket = io( DOMAIN , { transports: ['websocket'] });
    socket.on("connect", () => {
        console.log(`Socket conectado (id ${socket.id}). Uniendo a la sala ${roomId}`);
        const data = {
            roomId
        }
        console.log("Emitiendo joinRoom con payload:", data);
        socket.emit('join:room', { roomId });
    });
    socket.on('privateMessage', (msg: { from: string; content: string; timestamp: string }) => {
      privateMessages = [...privateMessages, msg];
    });

  });

  function sendPrivateMessage() {
    if (!newPrivateMessage.trim()) return;
    const message = {
      from: currentUser?.username || currentUser?.name || 'Desconocido', // si en algun planeta no existe el username o el name en el mensaje pone 'Desconocido'
      content: newPrivateMessage,
      timestamp: new Date().toISOString()
    };
    socket.emit('privateMessage', { roomId, message });
    newPrivateMessage = "";
  }
</script>

<style>
  .chat-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .messages {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 20px;
  }
  .message {
    padding: 6px;
    border-bottom: 1px solid #eee;
  }
  .chat-input {
    display: flex;
    gap: 10px;
  }
  .chat-input input[type="text"] {
    flex-grow: 1;
    padding: 8px;
  }
</style>

<h1>Chat Privado</h1>
{#if currentUser}
  <div class="chat-container">
    <div class="messages">
      {#each privateMessages as msg (msg.timestamp)}
        <div class="message">
          <strong>{msg.from}:</strong> {msg.content}
          <span style="font-size:0.8em; color: gray;">({new Date(msg.timestamp).toLocaleTimeString()})</span>
        </div>
      {/each}
    </div>
    <div class="chat-input">
      <input
        type="text"
        placeholder="Escribe tu mensaje..."
        bind:value={newPrivateMessage}
        on:keydown={(e) => e.key === 'Enter' && sendPrivateMessage()}
      />
      <button on:click={sendPrivateMessage}>Enviar</button>
    </div>
  </div>
{:else}
  <p>Debes <a href="/login">iniciar sesión</a> para chatear.</p>
{/if}