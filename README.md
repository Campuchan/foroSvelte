# Instalación

## .env

Hay que crear un archivo .env en la raiz del proyecto con la siguiente estructura:
```.env
MONGO_URL=(url de mongo con la base de datos)
//ejemplo: "mongodb://127.0.0.1:27017/foro"
DOMAIN=(dominio donde se encuentra el servidor)
//ejemplo: "http://localhost:5173" o "foro.com"

PUBLIC_WS_URL=(dominio donde se encuentra el servidor de websocket)
//ejemplo: "ws://localhost:34321"
PUBLIC_WS_PORT=(puerto para websocket, debe coincidir con la url de arriba)
//34321
```

## mongodb

con las mongo tools instaladas (https://www.mongodb.com/docs/database-tools/)
hay que importar la base de datos de mongo para que cumpla con la estructura necesaria