<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    let componenteVisible = false;
    let x = 0;
    let y = 0;
    let username = '';
    let name = '';
    let previewImage = '';
  
    // pone el componente siempre un poco abajo a la derecha del mouse
    function calcularPosicion(event: MouseEvent) {
      x = event.pageX + 22;
      y = event.pageY + 22;
    }
  
    function handleMouseOver(event: MouseEvent) {
      const target = event.target as HTMLElement;
      //console.log(target.tagName)
      if (target.tagName === 'A') { // al parecer tagName es mayuscula siempre
      // solo hace cuando es un link y va a un usuario
        const href = target.getAttribute('href');
        if (href && (href.startsWith('/user/') || href.startsWith('/chat/'))) {
          //console.log('href: ', href.split('/')[2]);
            if (href.startsWith('/chat/') && (!href.split('/')[2] || href.split('/')[2].trim() === '')) {
              componenteVisible = false;
              return;
            }
            // link de ejemplo : "/user/{username}"
          
          username = href.split('/')[2]; // "(0)/user(1)/{username}(2)"
          fetch(`/api/user/username/${username}`, { method: 'GET' })
            .then(async (response) => {
              if (response.ok) {
                const data = await response.json();
                //console.log('data: ', data);
                return data;
              } else {
                throw new Error('Error fetching user data');
              }
            })
            .then((data) => { 
              name = data.user;
              //console.log('name: ', name);
            })
            .catch((error) => {
              console.error('Error fetching user data:', error);
            });
          previewImage = `/images/${username}.jpg`;
          componenteVisible = true;
          calcularPosicion(event);
        }
      }
    }
  
    function handleMouseMove(event: MouseEvent) {
      if (componenteVisible) {
        calcularPosicion(event);
      }
    }
  
    function handleMouseOut(event: MouseEvent) {
      componenteVisible = false;
    }
  
    onMount(() => {
      document.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseout', handleMouseOut);
      document.addEventListener('click', handleMouseOut);
      // asi se cierra al hacer click,
      //  que cuando clica en un link no actualiza el mouseover hasta que pasa por otro elemento
    });
  </script>
  
  {#if componenteVisible}
  <div style="top: {y}px;
        left: {x}px;">  <!-- este style tiene que estar aqui para que coja x e y-->
        <h1>{name}</h1>
        <img
        src={previewImage}
        alt="foto de perfil flotante"
        aria-hidden="true"
       
      />
  </div>
    
  {/if}
<style>
    * {
        pointer-events: none;
        position: absolute;
        z-index: 1001;
    }
    div {
        border: black 1px solid;
        background-color: white;
    }
    h1{
        position: relative;
        top: 0;
        left: 0;
        margin: 4px;
        font-size: 1.3em;
    }
    img{
        position: relative;
        top: 10px;
        left: 0;
        width: 100px;
        height:100px;
        margin: 12px;
        margin-top: 0;
        padding: 4px;
        border-top: 1px solid grey;
    }

</style>