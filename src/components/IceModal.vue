<template>
  <div
    class="modal fade"
    tabindex="-1"
    role="dialog"
    :class="{in: show}" :style="{display: show ? 'block' : 'none'}">
    <div
      class="modal-dialog"
      role="document"
      :class="{'modal-lg': size === 'lg', 'modal-sm': size === 'sm'}">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" aria-label="Close" @click="close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h3 class="modal-title"><slot name="title"></slot></h3>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="close">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['show', 'size'],
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.modal {
  z-index: 4000;
  margin-top: 108px;
}

.modal-body {
  max-height: 480px;
  overflow-y: auto;
}

.modal-body h4 {
  margin-top: 20px;
}

</style>
