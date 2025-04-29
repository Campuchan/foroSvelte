<script lang="ts">
  import { onMount } from 'svelte';
  import { io } from 'socket.io-client';
  import { user } from '$lib/auth';
  import { get } from 'svelte/store';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import type { Mensaje } from '$lib/types/mensaje';
  import { PUBLIC_WS_URL } from '$env/static/public';
  import './chat.css';
  

  //export let data: { user2: { id: string; name: string; email: string; username: string } };
  const { data } = $props<{ data: { user2: { id: string; name: string; email: string; username: string } } }>();
  const currentUser = get(user);

  let roomId = $state("");
  let socket: any;
  let messages: { from: string; content: string; timestamp: string }[] = $state([]);
  let newMessage = $state("");
  let cargando = $state(true);
  let users: { name: string; username: string }[] = $state([]);

  /**
   * https://stackoverflow.com/a/21682946
   * 
   * @param string
   * @param saturation
   * @param lightness
   */
  var stringToColor = (string : string, saturation: number = 100, lightness: number = 75) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`;
  }
  
  function generateRoomId(userA: string, userB: string): string {
    return [userA, userB].sort().join('-');
  }

  function cambiarUsuario(userId: string) {
    console.log("cambiando usuario a", userId);
    invalidate("/chat/" + userId);
  }

  onMount(async () => {
    console.log("aaaaaaaaa")
    if(data.tipo == "publico"){ // segun si [[user2]] esta definido o no
      roomId = "general"
    } else {
      roomId = generateRoomId(data.user2.id, get(user)?.id || "");
    }
    try {
      const response = await fetch('/api/user');
      users = await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      cargando = false;
    }


    if (!currentUser) {
      goto('/?error=El usuario no está autenticado');
      return;
    }
    socket = io( PUBLIC_WS_URL , { transports: ['websocket'] });
    socket.on("connect", () => {
      console.log(`Socket conectado (id ${socket.id}).`);
      socket.emit('join:room', { roomId });
      console.log("Emitiendo joinRoom con payload:", { roomId });
      document.querySelector('#btnEnviar')?.setAttribute('disabled', 'true');
        fetch("/api/chat?roomId="+roomId+"&skip=0", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.mensajes.length > 0) {
            messages = data.mensajes.map((mensaje: Mensaje) => ({
              from: mensaje.from,
              content: mensaje.content,
              timestamp: mensaje.timestamp,
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
    // socket.on("connect", () => {
    //     console.log(`Socket conectado (id ${socket.id}). Uniendo a la sala ${roomId}`);
    //     const data = {
    //         roomId
    //     }
    //     console.log("Emitiendo joinRoom con payload:", data);
    //     socket.emit('join:room', { roomId });
    // });

    socket.on('message', (mensaje: { from: string; content: string; timestamp: string }) => {
      console.log("Mensaje privado recibido:", mensaje);
      messages = [...messages, mensaje];
    });
  });

  async function sendMessage() {
    if (!newMessage.trim()) return;
    const message = {
      from: currentUser?.username || currentUser?.name || 'Desconocido', // si en algun planeta no existe el username o el name en el mensaje pone 'Desconocido'
      content: newMessage,
      timestamp: new Date().toISOString(),
      roomId: roomId
    };
    socket.emit('message', { roomId, message });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: message.from,
          content: message.content,
          roomId: message.roomId
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
  .lista-users-container{
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .lista-user-item {
    padding: 8px;
    background-color: #f1f1f1;
    border: 1px solid #bbb;
    border-collapse: collapse;
    cursor: pointer;
    transition: background-color 0.3s;
    text-decoration: none;
    color: inherit;
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
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      {#if cargando}
      <p>Cargando usuarios...</p>
      {:else if users.length === 0}
      <a class="lista-user-item" href="/chat/" style="cursor: pointer;" data-sveltekit-reload>
        <span>Chat general</span>
      </a>
      <p>No hay usuarios disponibles.</p>
      {:else}
      <div class="header-lista-users">Usuarios:</div>
      <div class="lista-users-container">
        <a class="lista-user-item" href="/chat/" style="cursor: pointer;" data-sveltekit-reload>
          <span>Chat general</span></a>
        {#each users as user (user.username)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <a class="lista-user-item" href="/chat/{user.username}" style="cursor: pointer;" data-sveltekit-reload>
            <span>{user.name}</span></a>
        {/each}
      </div>
      {/if}
    </div>
    <div class="chat">
      {#if $user}
        <div class="chat-container">
          <div class="messages">
            {#each messages as mensaje, index (index)} <!-- index es la clave de cada mensaje -->
              <div class="message">
                <strong style="color: {stringToColor(mensaje.from)};">{mensaje.from}:</strong> {mensaje.content}
                <span style="font-size:0.8em; color: gray;">({new Date(mensaje.timestamp).toLocaleTimeString()})</span>
              </div>
            {/each}
          </div>
          <div class="chat-input">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              bind:value={newMessage}
              onkeydown={sendMessage}
            />
            <button id="btnEnviar" onclick={sendMessage}>Enviar</button>
          </div>
        </div>
      {:else}
        <p>Debes <a href="/login">iniciar sesión</a> para chatear.</p>
      {/if}
    </div>
</div>