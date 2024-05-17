import { applyVueInReact, applyPureVueInReact } from 'veaury'
// This is a Vue component
// import BasicVueComponent from './Basic.vue'
import { useState } from 'react'
import Cascader from '@/packages/element/ui/Cascader.vue'
// Use HOC 'applyVueInReact'
const ElCascader = applyVueInReact(Cascader)
// Use HOC 'applyPureVueInReact'
// const BasicWithPure = applyPureVueInReact(BasicVueComponent)
export default function () {
  return (
    <>
      <ElCascader></ElCascader>
    </>
  )
}
