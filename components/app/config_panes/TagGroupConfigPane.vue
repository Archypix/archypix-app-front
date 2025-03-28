<script setup lang="ts">
import {useTagsStore} from '~/stores/tags';
import {useToastService} from "#imports";

// TODO: Choose whether to use a default tag on the tag group or using one of the tags.
// TODO: When Required, force at least one tag to be default.
// TODO: Fix color pickers and setup auto color.

const props = defineProps({
  tagGroupId: {
    type: Number,
    required: true
  }
});

const tags_store = useTagsStore();

const current_tag_group = ref<TagGroup | null>(null);
const current_tags = ref<Tag[]>([]);

const isLoading = ref(true);
const confirm = useConfirm();

const isNewTagGroup = computed(() => props.tagGroupId === 0);

const loadTagGroup = async () => {
  isLoading.value = true;
  await tags_store.tags_loaded_promise;

  if (isNewTagGroup.value) {
    current_tag_group.value = {
      id: 0,
      user_id: 0,
      name: "New Tag Group",
      multiple: true,
      default_tag_id: undefined,
      required: false
    };
    // Add a default tag
    current_tags.value = [];
    addNewTag();
  } else {
    const tagGroupWithTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId);
    if (tagGroupWithTags) {
      current_tag_group.value = {...tagGroupWithTags.tag_group};
      current_tags.value = tagGroupWithTags.tags.map(tag => ({...tag}));
    }
  }
  isLoading.value = false;
};

watch(props, () => {
  loadTagGroup();
}, {immediate: true});

/// Tracking changes

const isTagGroupEdited = () => {
  if (!current_tag_group.value) return false;
  const originalTagGroup = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId)?.tag_group;
  if (!originalTagGroup) return true;
  return JSON.stringify(current_tag_group.value) !== JSON.stringify(originalTagGroup);
};
const editedTags = () => {
  if (!current_tag_group.value) return [];
  const originalTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId)?.tags || [];
  return current_tags.value.filter(t => t.id > 0 && originalTags.every(ot => {
    return JSON.stringify(ot) !== JSON.stringify(t);
  }));
};
const createdTags = () => {
  const originalTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId)?.tags || [];
  return current_tags.value.filter(t => t.id === 0 && !originalTags.some(ot => ot.name === t.name));
}
const deletedTags = () => {
  const originalTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId)?.tags || [];
  return originalTags.filter(ot => !current_tags.value.some(t => t.id === ot.id));
};

/// Save tag group changes

const saveTagGroup = async () => {
  if (!current_tag_group.value) return;

  if (isNewTagGroup.value) {
    const ok = await tags_store.createTagGroup(current_tag_group.value, current_tags.value);
    if (ok) {
      useToastService().success("Successfully created tag group");
      await usePicturesStore().back();
    }
  } else {
    let ok = true;
    if (isTagGroupEdited()) {
      ok = ok && await tags_store.editTagGroup(current_tag_group.value);
    }
    for (const tag of editedTags()) {
      ok = ok && await tags_store.editTag(tag);
    }
    for (const tag of deletedTags()) {
      ok = ok && await tags_store.deleteTag(tag.id);
    }
    for (const tag of createdTags()) {
      ok = ok && await tags_store.createTag(tag);
    }
    if (ok) {
      useToastService().success("Successfully edited tag group");
      await usePicturesStore().back();
    }
  }
};

/// Functions to create/delete tags

const deleteTagGroup = async (event: MouseEvent) => {
  if (isNewTagGroup.value) {
    await usePicturesStore().back();
    return;
  }

  confirm.require({
    target: event.currentTarget as HTMLElement | undefined,
    message: 'Do you want to delete this tag group and all its tags?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: async () => {
      await tags_store.deleteTagGroup(props.tagGroupId);
      await usePicturesStore().back();
    }
  });
};
const addNewTag = () => {
  // TODO: Create a default color using random new color
  const newTag: Tag = {
    id: 0,
    tag_group_id: props.tagGroupId,
    name: "New Tag",
    color: [66, 135, 245],
    is_default: false
  };
  current_tags.value.push(newTag);
};
const deleteTag = (_: MouseEvent, index: number) => {
  current_tags.value = current_tags.value.filter((_, i) => i !== index);
};


/// Helpers to connect the data with the UI

const isDefaultTag = computed(() => {
  return (tagId: number) => current_tag_group.value?.default_tag_id === tagId;
});
const setAsDefault = (tagId: number) => {
  if (current_tag_group.value) {
    current_tag_group.value.default_tag_id = tagId;
  }
};
const getTagColor = (tag: Tag) => {
  return {r: tag.color[0], g: tag.color[1], b: tag.color[2]}
};
const updateTagColor = (index: number, hexColor: any) => {
  current_tags.value[index].color = [hexColor.r, hexColor.g, hexColor.b];
};

</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="flex flex-col gap-3 items-center justify-center h-full my-4">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"/>
      <p>Loading</p>
    </div>

    <Message v-else-if="!current_tag_group" severity="error" :closable="false">
      Tag group not found
    </Message>

    <div v-else class="flex flex-col gap-6">
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>{{ isNewTagGroup ? 'Create Tag Group' : 'Edit Tag Group' }}</span>
            <Button
                v-if="!isNewTagGroup"
                icon="pi pi-trash"
                severity="danger"
                @click="deleteTagGroup"
                outlined
            />
          </div>
        </template>

        <template #content>
          <div class="flex flex-col gap-4">
            <div>
              <label for="tag-group-name" class="font-medium block mb-2">Name</label>
              <div class="flex items-center gap-3 ">
                <PictureTag
                    :tag_group="current_tag_group"
                />
                <InputText
                    id="tag-group-name"
                    v-model="current_tag_group.name"
                    class="w-full"
                    placeholder="Enter tag group name"
                />
              </div>
            </div>

            <div class="flex gap-6">
              <div class="flex items-center">
                <ToggleSwitch v-model="current_tag_group.multiple" class="mr-2"/>
                <label for="multiple">Allow multiple tags</label>
              </div>

              <div class="flex items-center">
                <ToggleSwitch v-model="current_tag_group.required" class="mr-2"/>
                <label for="required">Required</label>
                <i class="pi pi-info-circle text-red-700 ml-1"
                   v-tooltip.bottom="'If the tag group is required, each picture must have at least one tag of this tag group'"></i>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>Tags</template>
        <template #content>
          <div class="flex flex-col gap-3">
            <div v-for="(tag, index) in current_tags" :key="tag.id"
                 class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">

              <PictureTag
                  :tag="tag"
                  :tag_group="current_tag_group"
                  :tag_only="true"
              />

              <InputText v-model="current_tags[index].name" class="flex-1"/>

              <ColorPicker
                  :value="getTagColor(tag)"
                  @change="(e) => updateTagColor(index, e.value)"
                  format="rgb"
                  class="w-10"
              />

              <div class="flex items-center gap-3">
                <div class="flex items-center">
                  <Checkbox
                      :checked="isDefaultTag(tag.id)"
                      @change="setAsDefault(tag.id)"
                      :binary="true"
                      class="mr-2"
                      :inputId="`default-${tag.id}`"
                  />
                  <label :for="`default-${tag.id}`">Default</label>
                  <i class="pi pi-info-circle text-red-700 ml-1"
                     v-tooltip.bottom="'Default tags are automatically added to new pictures'"></i>
                </div>

                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    @click="(e) => deleteTag(e, index)"
                />
              </div>
            </div>

            <div>
              <Button
                  icon="pi pi-plus"
                  label="Add New Tag"
                  @click="addNewTag"
                  class="mt-3"
                  severity="success"
                  size="small"
              />
            </div>
          </div>
        </template>
      </Card>

      <div class="flex justify-end mt-4">
        <Button
            label="Save Changes"
            icon="pi pi-check"
            @click="saveTagGroup"
            severity="primary"
        />
      </div>
    </div>

    <ConfirmPopup/>
    <Toast/>
  </div>
</template>
