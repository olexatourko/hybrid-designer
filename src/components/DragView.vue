<template>
    <div class="drag_view" v-if="is_visible" v-html="inner_html" v-bind:style="style_object"></div>
</template>

<script>
    export default {
        name: 'DragView',
        mounted: function() {
            this.$store.commit('mount_drag_view', this);
        },
        data() {
            return {
                x: 0,
                y: 0
            }
        },
        watch: {
            "$store.state.drag_context": function(ctx) {
                this.x = 0;
                this.y = 0;
            },
            "$store.state.drag_event": function (event) {
                if (event.type == 'dragstart') {
                    this.x = event.x0;
                    this.y = event.y0;
                }
                else if (event.type == 'dragmove') {
                    this.x += event.dx;
                    this.y += event.dy;
                }
            }
        },
        computed: {
            is_visible: function() {
                if (this.$store.state.drag_context.name) {
                    return true;
                }
                return false;
            },
            inner_html: function() {
                if (this.$store.state.drag_context.el) {
                    return this.$store.state.drag_context.el;
                }
                return "";
            },
            style_object: function() {
                if (this.$store.state.drag_context.name) {
                    return {
                        transform: 'translate(' + this.x + 'px, ' + this.y + 'px)'
                    }
                } else {
                    return {
                        transform: ''
                    };
                }
            }
        },
    }
</script>

<style scoped>
    .drag_view {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.75;
    }
</style>