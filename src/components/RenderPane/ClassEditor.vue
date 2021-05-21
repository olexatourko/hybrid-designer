<template>
    <div class="class_editor">
        <div class="class_list">
            <button v-for="c in classes" :key="c" v-on:click="remove_class(c)">
                {{ c }}
            </button>
        </div>
        <div>
            <AutoComplete v-bind:suggestions="autoCompleteData" v-on:submit="add_class"/>
        </div>
    </div>
</template>

<script>
    import AutoComplete from '@/components/AutoComplete.vue'
    export default {
        name: 'ClassEditor',
        components: {
            AutoComplete
        },
        data() {
            return {
                autoCompleteData: [
                    {
                        'class': 'modal',
                        'doc': 'A modal with shadows and margin'
                    },
                    {
                        'class': 'btn',
                        'doc': 'A green button'
                    },
                    {
                        'class': 'btn_secondary',
                        'doc': 'A gray button'
                    },
                    // Tailwinds Demo stuff
                    {
                        'class': 'flex',
                        'doc': 'A block-level flex container',
                    },
                    {
                        'class': 'flex-row',
                        'doc': 'Position flex items horizontally in the same direction as text'
                    },
                    {
                        'class': 'flex-row-reverse',
                        'doc': 'Position flex items horizontally in the opposite direction'
                    },
                    {
                        'class': 'flex-col',
                        'doc': 'Position flex items vertically'
                    },
                    {
                        'class': 'flex-col-reverse',
                        'doc': 'Position flex items vertically in the opposite direction'
                    }
                ]
            }
        },
        props: {
            classes: {
                type: DOMTokenList,
                default: () => new DOMTokenList()
            }
        },
        methods: {
            add_class: function(cls) {
                this.classes.add(cls);
                this.$forceUpdate(); // Vue doesn't work with array-like objects in v-for I guess (DOMTokenList)
            },
            remove_class: function(cls) {
                if (this.classes == null) { return; }
                this.classes.remove(cls);
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
     .autocomplete { margin-top: 0.5rem; }
</style>