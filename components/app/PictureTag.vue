<script setup lang="ts">

const props = defineProps<{
  tag?: Tag | null, // If tag is omitted, only tag group is shown
  tag_group: TagGroup,
  tag_only?: boolean | null,
}>()

</script>

<template>
  <div class="badge"
       :style="!props.tag ? {} : {backgroundColor: 'rgb(' + props.tag.color.join(',') + ')'}"
       :class="{
           'tag-group-required': props.tag_group.required,
           'tag-group-multiple': props.tag_group.multiple,
           'tag-default': props.tag?.is_default,
           'tag-only': props.tag_only,
         }">

    <div class="tag-el tag-group" v-if="!props.tag_only">
      <span class="tag-group-name">{{ props.tag_group.name }}</span>
    </div>
    <div class="tag-group-arrow" v-if="!props.tag_only"/>

    <div class="tag-el tag" v-if="props.tag">
      <span class="tag-name"
        :class="{
          'tag-default': props.tag.is_default,
        }"
        :style="{color: 'rgb(' + props.tag.color.join(',') + ')'}"
      >{{ props.tag.name }}</span>
    </div>

  </div>


</template>

<style scoped lang="stylus">

.badge
  min-width min-content
  border-radius .9em
  display flex
  flex-flow row nowrap
  align-items stretch
  height 1.8em

  &.tag-group-required .tag-group, &.tag-group-required .tag-group-arrow
    background-color var(--red-900)
  &.tag-group-multiple
    border-radius .3em

  // Padding
  &.tag-group-multiple .tag-el
    padding 0 .5em
  &:not(.tag-group-multiple) .tag-el
    padding 0 .6em
  &:not(.tag-only) .tag-group
    padding-right 0
  &:not(.tag-only) .tag
    padding-left .3em

  // Tag elements
  .tag-el
    display flex
    align-items center
    font-weight 600

  .tag-group
    border-top-left-radius inherit
    border-bottom-left-radius inherit
    background-color var(--slate-900)
    color var(--slate-50)
    position relative

  .tag-group-arrow
    width .9em
    background-color var(--slate-900)
    clip-path: polygon(0 0, 100% 50%, 0 100%, 0 0);

  .tag
    filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
    mix-blend-mode: luminosity;
    opacity: 0.95;
    span.tag-default
      text-decoration underline

  span
    white-space nowrap


</style>
