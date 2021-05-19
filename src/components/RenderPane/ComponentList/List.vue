<template>
    <div class="component_list">
        <div class="components">
            <DOMComponent v-for="c in $store.state.components" :key="c.name" v-bind:name="c.name" v-bind:html="c.html"/>
        </div>
    </div>
</template>

<script>
    import DOMComponent from './Component';

    export default {
        name: 'List',
        components: {
          DOMComponent
        }
    }
</script>