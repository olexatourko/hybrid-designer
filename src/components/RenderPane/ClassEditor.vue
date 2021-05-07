<template>
    <div class="class_editor">
        <div class="class_list">
            <button v-for="c in classes" :key="c" v-on:click="remove_class(c)">
                {{ c }}
            </button>
        </div>
        <div>
            <input v-model="new_class" v-on:keyup.enter="add_class"/>
            <button v-on:click="add_class" v-bind:disabled="classes == null">Add</button>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ClassEditor',
        data() {
            return {
                new_class: null
            }
        },
        props: {
            classes: {
                type: DOMTokenList,
                default: () => new DOMTokenList()
            }
        },
        methods: {
            add_class: function() {
                if (this.classes == null) { return; }
                if (this.new_class) {
                    this.classes.add(this.new_class);
                    this.new_class = null;
                    // this.$emit('added_class', this.new_class);
                }
            },
            remove_class: function(c) {
                if (this.classes == null) { return; }
                this.classes.remove(c);
                // this.$emit('removed_class', c);
                this.$forceUpdate(); // Vue doesn't work with array-like objects in v-for I guess (DOMTokenList)
            }
        }
    }
</script>

<style scoped>
    button {
        margin: 0.5rem 0.5rem 0 0;
        padding: 0 0.5rem;
        background-color: rgb(220, 220, 220);
     }
     input {
        border: 1px solid rgb(220, 220, 220);
     }
</style>