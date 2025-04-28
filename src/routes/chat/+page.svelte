<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/auth';
  import { get } from 'svelte/store';
  import { io } from 'socket.io-client';
  import { goto } from '$app/navigation';
  import type { Mensaje } from '$lib/types/mensaje';

  let socket : any;
  let messages: { from: string; content: string; timestamp: string }[] = $state([]);
  let newMessage = $state("");
  let currentUser : any;
  let cargando = $state(true);

  let users: { name: string; username: string }[] = $state([]);

  onMount( async () => {

    try {
      const response = await fetch('/api/user');
      users = await response.json();
      console.log("aa " , users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      cargando = false;
    }

    document.querySelector('#btnEnviar')?.setAttribute('disabled', 'true');
    currentUser = get(user);
    if (!currentUser) {
      return;
    }
    socket = io( "localhost:34321" , { transports: ['websocket'] });

    socket.on("connect", () => {
      console.log(`Socket conectado (id ${socket.id}).`);
        fetch("/api/chat?roomId=general&skip=0", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.mensajes.length > 0) {
            messages = data.mensajes.map((msg: Mensaje) => ({
              from: msg.from,
              content: msg.content,
              timestamp: msg.timestamp,
            }));
            const chatContainer = document.querySelector('.messages');
            if (chatContainer) {
              //https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView     
              setTimeout(() => {
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
              }, 0); // sin el timeout no espera a que messages actualice
            }
          } else {
            messages = [];
          }
        })
        .then(() => {
          cargando = false;
          document.querySelector('#btnEnviar')?.removeAttribute('disabled');
        })
        .catch(error => console.error('Error fetching messages:', error));
    });

    socket.on("user:joined", (msg : { from: string }) => {
      console.log(msg.from + " se conectó ");
    });
    
    
    const chatContainer = document.querySelector('.messages');
    socket.on("chat:message", (msg : { from: string; content: string; timestamp: string }) => {
      messages = [...messages, msg];
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 0); // sin el timeout no espera a que messages actualice
    });
  });

  async function sendMessage() {
    if (!newMessage.trim()) return; // no envia mensajes vacios o solo espacios
    const msg = {
      from: currentUser.username || currentUser.name,
      content: newMessage,
      timestamp: new Date(),
      roomId: 'general'
    };
    socket.emit("chat:message", msg);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: msg.from,
          content: msg.content,
          roomId: msg.roomId
        }),
      });
      if (!response.ok) {
        console.error("Error storing the message:", await response.text());
      }
    } catch (error) {
      console.error("Error sending the message to the API:", error);
    }

    newMessage = "";
  }


  function mensajeEnter(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    width: 100%;
  }

  .lista-users {
    z-index: 1000;
    width: 100%;
    min-width: 80px;
    max-width: 160px;
    margin: 0 auto;
    margin-left: 120px;
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
    overflow-y: auto;
  }
  .lista-user-item {
    padding: 8px;
    background-color: #f1f1f1;
    border: 1px solid #bbb;
    border-collapse: collapse;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .chat {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
    margin-left: -120px;
  }
  .chat-container {
    width: 100%;
    min-width: 300px;
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
<div class="container">
    <div class="lista-users">
      {#if cargando}
        <p>Cargando usuarios...</p>
      {:else if users.length === 0}
        <p>No hay usuarios disponibles.</p>
      {:else}
        <div class="header-lista-users">Usuarios:
          {#each users as user (user.username)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="lista-user-item" onclick={() => goto("/chat/" + user.username)} style="cursor: pointer;">
              <span>{user.name}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="chat">
      {#if $user}
        <div class="chat-container">
          <div class="messages">
            {#each messages as msg, index (index)} <!-- index es la clave de cada mensaje -->
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
              onkeydown={mensajeEnter}
            />
            <button id="btnEnviar" onclick={sendMessage}>Enviar</button>
          </div>
        </div>
      {:else}
        <p>Debes <a href="/login">iniciar sesión</a> para chatear.</p>
      {/if}
    </div>
</div>
