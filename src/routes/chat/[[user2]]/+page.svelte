<script lang="ts">
  import { onMount } from 'svelte';
  import { io } from 'socket.io-client';
  import { user } from '$lib/auth';
  import { get } from 'svelte/store';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import type { Mensaje } from '$lib/types/mensaje';
  import { PUBLIC_WS_URL } from '$env/static/public';
  import './chat.css';
  import { formatoDate, stringToColor } from '$lib/functions';
  

  //export let data: { user2: { id: string; name: string; email: string; username: string } };
  const { data } = $props<{ data: { user2: { id: string; name: string; email: string; username: string } } }>();
  const currentUser = get(user);

  let roomId = $state("");
  let socket: any;
  let messages: { from: string; content: string; timestamp: string }[] = $state([]);
  let newMessage = $state("");
  let cargando = $state(true);
  let users: { name: string; username: string }[] = $state([]);

  
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

    socket.on('chat:message', (mensaje: { from: string; content: string; timestamp: string }) => {
      console.log("Mensaje privado recibido:", mensaje);
      messages = [...messages, mensaje];
      console.log("Mensajes:", messages);
      const chatContainer = document.querySelector('.messages');
      if (chatContainer) {
        //https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView     
        setTimeout(() => {
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 0); // sin el timeout no espera a que messages actualice
      }
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
    socket.emit('chat:message', { roomId, message });

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
<h1>Chat {#if data.user2 }con {data.user2.name}{/if}</h1>
<div class="container">
    <div class="lista-users">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="chat-general">
        <a class="lista-user-item" href="/chat/" style="cursor: pointer;" data-sveltekit-reload>
          Chat general
        </a>
      </div>
      {#if cargando}
      <p>Cargando usuarios...</p>
      {:else if users.length === 0}
      <p>No hay usuarios disponibles.</p>
      {:else}
      <div class="header-lista-users">Usuarios:</div>
      <div class="lista-users-container">
        {#each users as user (user.username)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <a class="lista-user-item" href="/chat/{user.username}" style="cursor: pointer;" data-sveltekit-reload>
            {user.name}</a>
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
                <strong style="color: {stringToColor(mensaje.from, 100, 25)};">{mensaje.from}:</strong> {mensaje.content}
                <span style="font-size:0.8em; color: gray;">({formatoDate(new Date(mensaje.timestamp))})</span>
              </div>
            {/each}
          </div>
          <div class="chat-input">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              bind:value={newMessage}
              onkeydown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button id="btnEnviar" onclick={() => sendMessage()}>Enviar</button>
          </div>
        </div>
      {:else}
        <p>Debes <a href="/login">iniciar sesión</a> para chatear.</p>
      {/if}
    </div>
</div>