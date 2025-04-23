<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/auth';
  import { get } from 'svelte/store';
  import { io } from 'socket.io-client';

  let socket : any;
  let messages: { from: string; content: string; timestamp: string }[] = [];
  let newMessage = "";
  let currentUser : any;

  onMount(() => {
    currentUser = get(user);
    if (!currentUser) {
      return;
    }
    socket = io( "localhost:34321" , { transports: ['websocket'] });

    socket.on("chat:message", (msg : { from: string; content: string; timestamp: string }) => {
      messages = [...messages, msg];
    });
  });

  function sendMessage() {
    if (!newMessage.trim()) return;
    const msg = {
      from: currentUser.username || currentUser.name,
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    socket.emit("chat:message", msg);
    newMessage = "";
  }
</script>

<style>
  .chat-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  .messages {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    padding: 10px;
  }
  .message {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  .message strong {
    margin-right: 8px;
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

<h1>Chat</h1>
{#if $user}
  <div class="chat-container">
    <div class="messages">
      {#each messages as msg (msg.timestamp)}
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
        bind:value={newMessage}
        on:keydown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button on:click={sendMessage}>Enviar</button>
    </div>
  </div>
{:else}
  <p>Debes <a href="/login">iniciar sesión</a> para chatear.</p>
{/if}