<template>
    <div class="component" ref="el" data-type="component">
        {{ name }}
    </div>
</template>

<script>
    import interact from 'interactjs'

    export default {
        name: 'Component',
        mounted: function() {
            interact(this.$refs.el).draggable({
                onstart: (event) => {
                    // Because onstart and the first onmove events are fired within a single Vue tick
                    this.$nextTick(() => {
                        this.$store.commit('drag_event', event);
                        this.$store.commit('push_drag_context', {
                            name: this.name,
                            el: this.html
                        });
                    });
                },
                onmove: (event) => {
                    this.$store.commit('drag_event', event);
                },
                onend: (event) => {
                    this.$store.commit('drag_event', event);
                    this.$store.commit('push_drag_context', {});
                }
            });
        },
        props: {
            name: {
                type: String
            },
            html: {
                type: String
            }
        }
    }
</script>

<style scoped>
    .component {
        cursor: pointer;
        display: inline-block;
        position: relative;
        margin: 0.5rem 0.5rem 0 0;
        padding: 0 0.5rem;
        background-color: rgb(220, 220, 220);
     }
     .component .ghost {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0 0.5rem;
        background-color: rgb(220, 220, 220);
     }
</style>