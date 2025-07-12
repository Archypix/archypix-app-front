<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import InputNumber from 'primevue/inputnumber';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
  altitude?: number | null;
}

const props = defineProps({
  modelValue: {
    type: Object as () => Coordinates | null | undefined,
    default: null,
  },
  title: {
    type: String,
  },
  placeholder: {
    type: String,
    default: 'Lat, Long'
  },
  showAltitude: {
    type: Boolean,
    default: false
  },
  nullable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showMapButton: {
    type: Boolean,
    default: true
  },
  mapProvider: {
    type: String,
    default: 'openstreetmap', // or 'google', 'mapbox', etc.
    validator: (value: string) => ['openstreetmap', 'google', 'mapbox'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const latitude = ref(props.modelValue?.latitude ?? null);
const longitude = ref(props.modelValue?.longitude ?? null);
const altitude = ref(props.modelValue?.altitude ?? null);

watch(() => props.modelValue, (val) => {
  latitude.value = val?.latitude ?? null;
  longitude.value = val?.longitude ?? null;
  altitude.value = val?.altitude ?? null;
});

const save = () => {
  const newValue: Coordinates = {
    latitude: latitude.value,
    longitude: longitude.value,
  };
  if (props.showAltitude) {
    newValue.altitude = altitude.value;
  }

  if (newValue.latitude !== props.modelValue?.latitude ||
      newValue.longitude !== props.modelValue?.longitude ||
      (props.showAltitude && newValue.altitude !== props.modelValue?.altitude)) {
    emit('update:modelValue', newValue);
    emit('save');
  }
};

const cancel = () => {
  latitude.value = props.modelValue?.latitude ?? null;
  longitude.value = props.modelValue?.longitude ?? null;
  altitude.value = props.modelValue?.altitude ?? null;
};

const displayValue = computed(() => {
  if (!props.modelValue || props.modelValue.latitude === null || props.modelValue.longitude === null) {
    return null;
  }
  let formatted = `${props.modelValue.latitude.toFixed(4)}, ${props.modelValue.longitude.toFixed(4)}`;
  if (props.showAltitude && props.modelValue.altitude !== null && props.modelValue.altitude !== undefined) {
    formatted += `, ${props.modelValue.altitude.toFixed(1)}m`;
  }
  return formatted;
});

</script>

<template>
  <BaseEditableProp
    :value="displayValue"
    :title="title"
    @save="save"
    @cancel="cancel"
  >
    <template #input="{ save, cancel }">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <InputNumber
            v-model="latitude"
            class="w-32 py-0.5 px-2 text-sm"
            placeholder="Latitude"
            :min="-90"
            :max="90"
            :minFractionDigits="2"
            :maxFractionDigits="6"
            @keydown.enter="save"
            @keydown.esc="cancel"
            @blur="save"
          />
          <InputNumber
            v-model="longitude"
            class="w-32 py-0.5 px-2 text-sm"
            placeholder="Longitude"
            :min="-180"
            :max="180"
            :minFractionDigits="2"
            :maxFractionDigits="6"
            @keydown.enter="save"
            @keydown.esc="cancel"
            @blur="save"
          />
          <Button
            v-if="showMapButton"
            icon="pi pi-map"
            class="self-end mb-1"
            text
            @click="openMap"
            v-tooltip="'Open map'"
          />
        </div>
        <InputNumber
          v-if="showAltitude"
          v-model="altitude"
          class="w-full py-0.5 px-2 text-sm"
          placeholder="Altitude (m)"
          :minFractionDigits="1"
          :maxFractionDigits="2"
          @keydown.enter="save"
          @keydown.esc="cancel"
          @blur="save"
        />
        <div class="flex justify-between items-center mt-2">
          <div v-if="latitude !== null && longitude !== null" class="text-xs">
            <a
              :href="`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`"
              target="_blank"
              class="text-primary-600 hover:underline"
              @click.stop
            >
              View on OpenStreetMap
            </a>
          </div>

          <div class="flex gap-1 ml-auto">
            <Button
              icon="pi pi-check"
              size="small"
              text
              severity="success"
              @click="save"
            />
            <Button
              v-if="nullable"
              icon="pi pi-times"
              size="small"
              text
              severity="danger"
              @click="emit('update:modelValue', null); emit('save');"
            />
          </div>
        </div>
      </div>
    </template>
  </BaseEditableProp>

  <!-- Map Modal -->
  <Dialog
    v-model:visible="showMap"
    modal
    header="Select Location on Map"
    :style="{ width: '90vw', maxWidth: '800px' }"
  >
    <div class="map-container" style="height: 60vh; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
      <p class="text-gray-500">Map integration would go here</p>
      <!-- In a real implementation, you would integrate with a map library like Leaflet or Google Maps -->
    </div>
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" icon="pi pi-times" text @click="showMap = false" />
        <Button label="Use Current Location" icon="pi pi-crosshairs" @click="handleMapSelect(0, 0)" />
        <Button label="Save Location" icon="pi pi-check" @click="save" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-inputtext) {
  text-align: left;
}
.map-container {
  border-radius: 4px;
  overflow: hidden;
}
</style>
