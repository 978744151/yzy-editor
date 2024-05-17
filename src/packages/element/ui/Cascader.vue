<template>
  <el-cascader :model-value="props.value" v-bind="$attrs" @change="handleChange" />
</template>
<!-- 
   注意：目前该项目中vue3不支持ts，虽然运行正常，但是打包有问题
 -->
<script setup>
import { ElCascader } from 'element-plus'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps(['value'])
const emit = defineEmits(['change'])

const handleChange = (event) => emit('change', event)
</script>
