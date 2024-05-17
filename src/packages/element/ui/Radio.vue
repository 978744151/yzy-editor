<!-- 
   注意：目前该项目中vue3不支持ts，虽然运行正常，但是打包有问题
 -->
<template>
  <el-radio-group
    :class="{ 'el-radio-filter': styleMode === 'filter' }"
    :model-value="props.value"
    v-bind="$attrs"
    @change="handleChange"
  >
    <el-radio v-for="(item, i) in options" :label="item[valueField]" :key="i">
      {{ item[labelField] }}
    </el-radio>
  </el-radio-group>
</template>

<script setup>
import { ElRadio, ElRadioGroup } from 'element-plus'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  value: { type: [String, Number, Boolean] },
  options: { type: Array, default: () => [] },
  labelField: { type: String, default: 'label' },
  valueField: { type: String, default: 'value' },
  styleMode: { type: String, default: 'default' }, // default | filter
})

const emit = defineEmits(['change'])

const handleChange = (event) => emit('change', event)
</script>

<style lang="scss">
.el-radio-filter {
  .el-radio__input {
    display: none !important;
  }
  .el-radio {
    margin-right: 10px;
    color: #333;
    &.is-checked {
      & > .el-radio__label {
        color: #fff;
        background: var(--el-color-primary);
      }
    }

    &:hover {
      .el-radio__label {
        color: #fff;
        background: var(--el-color-primary);
      }
    }
  }

  .el-radio__label {
    display: block;
    font-size: 14px;
    padding: 5px 14px;
    border-radius: 2px;
  }
}
</style>
