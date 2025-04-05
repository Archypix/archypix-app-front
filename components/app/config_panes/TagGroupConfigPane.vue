<script setup lang="ts">
import {useTagsStore} from '~/stores/tags';
import {getNextAvailableColor} from '~/composables/colors';

const props = defineProps({
  tagGroupId: {
    type: Number,
    required: true
  }
});

const tags_store = useTagsStore();

const current_tag_group = ref<TagGroup | null>(null);

const current_tags = reactive<Tag[]>([]);
const defaultTagForSingleTagsGroup = ref<number | null>(null);
const error = ref<string | null>(null);

const isLoading = ref(true);
const confirm = useConfirm();

const isNewTagGroup = computed(() => props.tagGroupId === 0);


const loadTagGroup = async () => {
  isLoading.value = true;
  await tags_store.tags_loaded_promise;
  current_tags.splice(0)

  if (isNewTagGroup.value) {
    current_tag_group.value = {
      id: 0,
      user_id: 0,
      name: "New Tag Group",
      multiple: true,
      required: false
    };
    // Add a default tag

    addNewTag();
  } else {
    const tagGroupWithTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId);
    if (tagGroupWithTags) {
      current_tag_group.value = {...tagGroupWithTags.tag_group};
      current_tags.push(...tagGroupWithTags.tags.map(tag => ({...tag})));

      updateIsDefaultForSingleTagsGroup();
    }
  }
  isLoading.value = false;
};

watch(props, () => {
  loadTagGroup();
}, {immediate: true});

// Update the tag that has the is_default flag to true

const updateIsDefaultForSingleTagsGroup = () => {
  if (!current_tag_group.value?.multiple) {
    if (defaultTagForSingleTagsGroup.value == null) {
      const defaultTag = current_tags.find(tag => tag.is_default);
      defaultTagForSingleTagsGroup.value = defaultTag?.id || null;
    }
    current_tags.forEach(tag => {
      tag.is_default = tag.id === defaultTagForSingleTagsGroup.value;
    });
  } else {
    defaultTagForSingleTagsGroup.value = null;
  }
};
watch(defaultTagForSingleTagsGroup, updateIsDefaultForSingleTagsGroup);
watch(current_tag_group, updateIsDefaultForSingleTagsGroup);


// If the tag group is required and it has no default tag, select the first tag different from tagId as default.
const checkRequired = (tagId: number | null = null) => {
  if (current_tag_group.value?.required) {
    if (!current_tags.some(tag => tag.is_default)) {
      if (!current_tag_group.value?.multiple) {
        defaultTagForSingleTagsGroup.value = current_tags[0].id
        updateIsDefaultForSingleTagsGroup()
      } else {
        let other_index = current_tags.findIndex(tag => tag.id !== tagId);
        if (other_index !== -1) {
          current_tags[other_index].is_default = true;
        }
      }
    }
  }
};

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
  return current_tags.filter(t => t.id > 0 && originalTags.every(ot => {
    return JSON.stringify(ot) !== JSON.stringify(t);
  }));
};
const createdTags = () => {
  const originalTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId)?.tags || [];
  return current_tags.filter(t => t.id === 0 && !originalTags.some(ot => ot.name === t.name));
}
const deletedTags = () => {
  const originalTags = tags_store.all_tags.find(tg => tg.tag_group.id === props.tagGroupId)?.tags || [];
  return originalTags.filter(ot => !current_tags.some(t => t.id === ot.id));
};

/// Save tag group changes

const validate = () => {
  if (!current_tag_group.value) return false;

  if (current_tag_group.value.name.length > 32) {
    error.value = "Tag group name cannot exceed 32 characters";
    return false;
  }
  if (current_tag_group.value.name.length === 0) {
    error.value = "Tag group name cannot be empty";
    return false;
  }
  for (const tag of current_tags) {
    if (tag.name.length > 32) {
      error.value = `Tag "${tag.name}" cannot exceed 32 characters`;
      return false;
    }
    if (tag.name.length === 0) {
      error.value = `Tag name cannot be empty`;
      return false;
    }
  }

  // At least one default tag when tag group is required
  if (current_tag_group.value.required) {
    if (!current_tags.some(tag => tag.is_default)) {
      error.value = "Required tag groups must have at least one default tag";
      return false;
    }
  }
  error.value = null;
  return true;
};
const saveTagGroup = async () => {
  if (!current_tag_group.value) return;

  if (!validate()) {
    return;
  }

  if (isNewTagGroup.value) {
    const ok = await tags_store.createTagGroup(current_tag_group.value, current_tags);
    if (ok) {
      await usePicturesStore().back();
    }
  } else {
    const ok = await tags_store.editTagGroup(
        current_tag_group.value,
        createdTags(),
        editedTags(),
        deletedTags().map(t => t.id)
    );
    if (ok) {
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
  const usedColors = current_tags.map(tag => tag.color);
  const newTag: Tag = {
    id: 0,
    tag_group_id: props.tagGroupId,
    name: "New Tag",
    color: getNextAvailableColor(usedColors),
    is_default: !!current_tag_group.value?.required && current_tags.length === 0
  };
  current_tags.push(newTag);
};
const deleteTag = (_: MouseEvent, index: number) => {
  current_tags.splice(index, 1);
  checkRequired()
};


/// Helpers to connect the data with the UI

const getTagColor = (tag: Tag) => {
  return {r: tag.color[0], g: tag.color[1], b: tag.color[2]}
};
const updateTagColor = (index: number, hexColor: any) => {
  current_tags[index].color = [hexColor.r, hexColor.g, hexColor.b];
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
                <ToggleSwitch v-model="current_tag_group.multiple" @change="updateIsDefaultForSingleTagsGroup" class="mr-2"/>
                <label for="multiple">Allow multiple tags</label>
              </div>

              <div class="flex items-center">
                <ToggleSwitch v-model="current_tag_group.required" @change="_ => checkRequired()" class="mr-2"/>
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

              <ColorPickerPopover
                  :color="tag.color"
                  @update:color="tag.color = $event"
              />
<!--                  v-moder:color="tag.color"-->

              <div class="flex items-center gap-3">
                <div class="flex items-center">
                  <template v-if="current_tag_group.multiple">
                    <Checkbox
                        v-model="tag.is_default"
                        :binary="true"
                        class="mr-2"
                        :disabled="current_tag_group.required && current_tags.length <= 1 && tag.is_default"
                        :inputId="`default-${tag.id}`"
                        @change="_ => checkRequired(tag.id)"
                    />
                  </template>
                  <template v-else>
                    <RadioButton
                        v-model="defaultTagForSingleTagsGroup"
                        :value="tag.id"
                        class="mr-2"
                        :inputId="`default-${tag.id}`"
                        name="default-tag"
                        @click="(e: MouseEvent) => { // Make possible to unselect the default tag only if the tag group is not required
                          if (current_tag_group?.required) return;
                          if (defaultTagForSingleTagsGroup === tag.id) {
                            e.preventDefault()
                            tag.is_default = false;
                            defaultTagForSingleTagsGroup = null;
                          }
                        }"
                    />
                  </template>
                  <label :for="`default-${tag.id}`">Default</label>
                  <i class="pi pi-info-circle text-red-700 ml-1"
                     v-tooltip.bottom="'Default tags are automatically added to new pictures'"></i>
                </div>

                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    :disabled="current_tags.length <= 1"
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

      <div class="flex justify-end mt-4 gap-4 items-center">
        <Message severity="error" icon="pi pi-info-circle" v-if="error">
          <span>{{ error }}</span>
        </Message>
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
