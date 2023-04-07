<template>
    <div class="main">
        <div class="welcome">
            <img src="/assets/logo.png" alt="logo" width="300" height="300" />
            <h2 class="text-blue-900 mb-3 mt-2">
                Welcome to Typerefinery.io
            </h2>
            <p class="text-black">
                We are building next generation Experience for Knowledge Graphs.
            </p>
        </div>
    </div>
</template>
<script>
export default {
    name: "Welcome",
}
</script>
<style scoped>
.main {
    margin: auto;
}

.welcome {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>