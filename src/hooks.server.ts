import { start_mongo } from "$db/mongo";

start_mongo().then(() => {
    console.log("MongoDB conectado");
}) .catch((err) => {
    console.error("MongoDB error conexion:", err);
});

