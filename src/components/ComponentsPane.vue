<template>
    <div class="components_pane">
        <div>Components</div>
    </div>
</template>

<script>
export default {
  name: 'ComponentsPane',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .components_pane {
        background-color: rgb(233, 220, 164);
        padding: 1rem;
        opacity: 0.5;
    }
</style>
