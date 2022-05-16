<template>
  <maps v-if="$route.params.id === 'maps'" />
  <charts v-else-if="$route.params.id === 'charts'" />
  <chat v-else-if="$route.params.id === 'chat'" />
  <project v-else />
</template>

<script>
  import Project from "@/components/Project"
  import Charts from "@/components/Charts"
  import Maps from "@/components/Maps"
  import Chat from "@/components/Chat"
  export default {
    name: "Home",
    components: { Project, Charts, Maps, Chat },

    data() {
      return {}
    },
  }
</script>
