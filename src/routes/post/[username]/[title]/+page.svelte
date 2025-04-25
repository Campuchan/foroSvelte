<script lang="ts">
    export let data;
    const post = data.post;
</script>
<style>
    .container {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
<div class="container">
    <h1>{post.title}</h1>
    <h2>por <a href="/user/{post.username}">{post.username}</a></h2>
    <p>{post.content}</p>

</div>

