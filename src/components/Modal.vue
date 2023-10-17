<template>
    <div class="modal" v-bind:class="{'modal-close': !isActive, 'modal-open' : isActive}">
        <div class="modal__content">
            <span class="modal__content-close closemark" @click="$emit('onClose')">&times;</span>
            <div class="modal__content-title">
                <slot name="title"></slot>
            </div>
            <div class="modal__content-main">
                <slot name="main"></slot>
            </div>
            <div class="modal__content-actions">
                <slot name="actions"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps(['isActive'])
</script>