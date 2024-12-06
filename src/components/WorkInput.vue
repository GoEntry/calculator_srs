<template>
  <div class="work">
    <h4 class="work__title">Работа {{ index + 1 }}</h4>
    <label>Вес: <input v-model.number="work.weight" type="number" step="0.01" required></label>
    <label>Максимум: <input v-model.number="work.maxPoints" type="number" step="0.01" required></label>
    <label>Получено: <input v-model.number="work.achievedPoints" type="number" step="0.01" required></label>
  </div>
</template>

<script>
export default {
  props: {
    index: Number,
    modelValue: {
      type: Object,
      required: true
    }
  },
  computed: {
    work: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  }
};
</script>
