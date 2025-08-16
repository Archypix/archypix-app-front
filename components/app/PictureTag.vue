<script setup lang="ts">
import {useTagsStore} from '~/stores/tags';

const props = defineProps<{
  tag?: Tag | null, // If tag is omitted, only tag group is shown
  tag_group: TagGroup,
  tag_only?: boolean | null,
  picture_id?: number | null, // If picture_id is provided, the user will be able to untag the picture
  dimmed?: boolean,
}>();

const emit = defineEmits<{
  update: []
}>();

const tagsStore = useTagsStore();
const isHovering = ref(false);
const isRemoving = ref(false);

const handleRemoveTag = async () => {
  if (!props.tag || !props.picture_id) return;

  isRemoving.value = true;
  try {
    await tagsStore.editPicturesTags([props.picture_id], [], [props.tag.id]);
  } finally {
    isRemoving.value = false;
    emit('update');
  }
}
</script>

<template>
  <div class="badge"
       :style="!props.tag ? {} : {backgroundColor: 'rgb(' + props.tag.color.join(',') + ')'}"
       :class="{
           'tag-group-required': props.tag_group.required,
           'tag-group-multiple': props.tag_group.multiple,
           'tag-default': props.tag?.is_default,
           'tag-only': props.tag_only,
           'dimmed': props.dimmed,
         }"
       @mouseenter="isHovering = !!picture_id && !!tag"
       @mouseleave="isHovering = false">

    <div class="tag-el tag-group" v-if="!props.tag_only">
      <span class="tag-group-name">{{ props.tag_group.name }} ({{ props.tag_group.id }})</span>
    </div>
    <div class="tag-group-arrow" v-if="!props.tag_only"/>

    <div class="tag-el tag" v-if="props.tag">
      <span
          class="tag-name"
          :class="{
              'tag-default': props.tag.is_default,
            }"
          :style="{color: isHovering ? 'transparent' : 'rgb(' + props.tag.color.join(',') + ')'}"
      >{{ props.tag.name }} ({{ props.tag.id }})</span>

      <button v-if="isHovering"
              class="remove-tag-btn"
              @click="handleRemoveTag"
              :disabled="isRemoving">
        <i class="pi pi-times" :class="{'pi-spin': isRemoving}"/>
      </button>
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
  user-select none

  &.tag-group-required .tag-group, &.tag-group-required .tag-group-arrow
    background-color var(--p-red-900)

  &.tag-group-multiple
    border-radius .3em

  &.dimmed
    opacity 0.5

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
    position relative

  .tag-group
    border-top-left-radius inherit
    border-bottom-left-radius inherit
    background-color var(--p-slate-900)
    color var(--p-slate-50)
    position relative

  .tag-group-arrow
    width .9em
    background-color var(--p-slate-900)
    clip-path: polygon(0 0, 100% 50%, 0 100%, 0 0);

  .tag
    filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
    mix-blend-mode: luminosity;
    opacity: 0.95;

    span.tag-default
      text-decoration underline

  span
    white-space nowrap

  .remove-tag-btn
    background none
    border none
    cursor pointer

    padding 0
    height 100%
    width 100%
    transition opacity 0.2s ease

    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)

    display flex
    align-items center
    justify-content center

    i
      color var(--p-slate-50)
      opacity 0.8

      &:hover
        opacity 1

      &:disabled
        cursor not-allowed
        opacity 0.5

</style>
