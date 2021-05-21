<template>
    <div class="autocomplete" style="position: relative;" v-on:keydown.down="down_pressed" v-on:keydown.up="up_pressed" v-on:keydown.enter="submit_on_enter">
        <input type="text" v-model.trim="text"/>
        <button v-on:click="submit_on_enter">{{ button_text }}</button>
        <ul v-if="text && shown_suggestions.length > 0">
            <li v-for="(suggestion, idx) in shown_suggestions"
            v-bind:key="suggestion.class"
            v-bind:class="{selected: idx == selected_index}"
            v-on:click="submit_on_click(idx, $event)">
                <span class="matched">{{ suggestion.matched }}</span>
                <span class="unmatched">{{ suggestion.unmatched }}</span>
                <div class="doc" v-if="suggestion.doc">
                    {{ suggestion.doc }}
                </div>
            </li>
        </ul>
    </div>
</template>

<script>

export default {
    data: function() {
        return {
            button_text: "Submit",
            text: "",
            selected_index: null
        }
    },
    props: {
        suggestions: {
            type: Array,
            required: true
        }
    },
    computed: {
        shown_suggestions: function() {
            let results = []
            for (let suggestion of this.suggestions) {
                let search_idx = suggestion.class.search('^' + this.text);
                if (search_idx > -1) {
                    results.push({
                        'class': suggestion.class,
                        'doc': suggestion.doc,
                        'matched': suggestion.class.substr(search_idx, this.text.length),
                        'unmatched': suggestion.class.substr(this.text.length, suggestion.length)
                    });
                }
            }
            return results;
        }
    },
    watch: {
        shown_suggestions: function() {
            this.selected_index = -1;
        }
    },
    methods: {
        reset: function() {
            this.text = "";
        },
        up_pressed: function(event) {
            event.preventDefault();
            if (this.shown_suggestions) {
                if (this.selected_index >= 0) {
                    this.selected_index = Math.max(--this.selected_index, -1)
                } else {
                    this.selected_index = 0;
                }
            }
        },
        down_pressed: function(event) {
            event.preventDefault();
            if (this.shown_suggestions) {
                if (this.selected_index >= 0) {
                    this.selected_index = Math.min(++this.selected_index, this.shown_suggestions.length-1)
                } else {
                    this.selected_index = 0;
                }
            }
        },
        submit_on_enter: function(event) {
            if (this.selected_index >= 0) {
                this.$emit('submit', this.shown_suggestions[this.selected_index].class)
            } else {
                this.$emit('submit', this.text)
            }
            this.reset();
        },
        submit_on_click: function(idx, event) {
            this.$emit('submit', this.shown_suggestions[idx].class)
            this.reset();
        }
    }
}
</script>

<style scoped>
    input {
        box-sizing: border-box;
        border: 1px solid rgb(220, 220, 220);
        height: 1.5rem;
        padding: 0 0.25rem;
    }
    input:focus { outline: none; }
    button {
        padding: 0 0.5rem;
        background-color: rgb(220, 220, 220);
    }
    ul {
        position: absolute;
        margin-top: -1px;
        border: 1px solid rgb(220, 220, 220);
        background-color: rgb(255, 255, 255);
        z-index: 999;
        box-shadow: rgba(0, 0, 0, 0.15) 0px 0.25rem 1rem;
    }
    li {
        padding: 0.25rem 0.5rem;
        cursor: pointer;
    }
    li.selected .matched,
    li.selected .unmatched {
        font-weight: bold;
    }
    .matched {
        background-color: rgb(205, 235, 255);
    }
    .doc {
        color: rgb(145, 143, 143);
        line-height: 1rem;
    }
</style>