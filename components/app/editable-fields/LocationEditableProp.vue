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
    type: [String, Object, null, undefined],
    default: null,
    validator: (value: any) => {
      if (value === null || value === undefined || value === '') return true;

      if (typeof value === 'string') {
        const parts = value.split(',').map(Number);
        return parts.length >= 2 && parts.every(coord => !isNaN(coord));
      }

      // It's a coordinates object
      const hasLat = 'latitude' in value && (value.latitude === null || !isNaN(Number(value.latitude)));
      const hasLng = 'longitude' in value && (value.longitude === null || !isNaN(Number(value.longitude)));
      const hasAlt = !('altitude' in value) || value.altitude === null || !isNaN(Number(value.altitude));

      return hasLat && hasLng && hasAlt;
    }
  },
  placeholder: {
    type: String,
    default: 'Enter coordinates (lat, lng)'
  },
  nullable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showAltitude: {
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

const coordinates = ref<Coordinates>({
  latitude: null,
  longitude: null,
  altitude: null
});

const showMap = ref(false);

function parseCoordinates(value: string | Coordinates | null | undefined): Coordinates | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const parts = value.split(',').map(Number);
    if (parts.length >= 2 && !parts.some(isNaN)) {
      return {
        latitude: parts[0],
        longitude: parts[1],
        altitude: parts[2] || null
      };
    }
    return null;
  }

  // It's already a coordinates object
  return {
    latitude: value.latitude !== undefined ? Number(value.latitude) : null,
    longitude: value.longitude !== undefined ? Number(value.longitude) : null,
    altitude: value.altitude !== undefined ? Number(value.altitude) : null
  };
}

function formatCoordinates(coords: Coordinates | null): string {
  if (!coords || coords.latitude === null || coords.longitude === null) return '';

  let formatted = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  if (props.showAltitude && coords.altitude !== null) {
    formatted += `, ${coords.altitude.toFixed(2)}m`;
  }

  return formatted;
}

function validateCoordinates(coords: Coordinates): boolean {
  if (coords.latitude === null || coords.longitude === null) return true;

  if (coords.latitude < -90 || coords.latitude > 90) return false;
  if (coords.longitude < -180 || coords.longitude > 180) return false;

  return true;
}

function handleSave() {
  if (!coordinates.value || coordinates.value.latitude === null || coordinates.value.longitude === null) {
    emit('update:modelValue', null);
    emit('save', null);
    return;
  }

  if (validateCoordinates(coordinates.value)) {
    const value = `${coordinates.value.latitude},${coordinates.value.longitude}` +
                 (props.showAltitude && coordinates.value.altitude !== null ? `,${coordinates.value.altitude}` : '');
    emit('update:modelValue', value);
    emit('save', value);
  }
}

function openMap() {
  showMap.value = true;
  // In a real implementation, you would open a map component here
  // and update the coordinates when a location is selected
}

function handleMapSelect(lat: number, lng: number) {
  coordinates.value.latitude = lat;
  coordinates.value.longitude = lng;
  handleSave();
  showMap.value = false;
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal === null || newVal === undefined || newVal === '') {
    coordinates.value = { latitude: null, longitude: null, altitude: null };
  } else {
    const parsed = parseCoordinates(newVal);
    if (parsed) {
      coordinates.value = parsed;
    }
  }
}, { immediate: true });
</script>

<template>
  <div class="location-field">
    <BaseEditableProp
      v-bind="$props"
      :model-value="modelValue"
      :format="formatCoordinates"
      :validate="() => true"
      @update:model-value="(val) => emit('update:modelValue', val)"
      @save="handleSave"
    >
      <template #input="{ inputValue, save, cancel }">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Latitude</label>
              <InputNumber
                v-model="coordinates.latitude"
                class="w-full"
                :min="-90"
                :max="90"
                :step="0.000001"
                :minFractionDigits="6"
                :maxFractionDigits="6"
                placeholder="Latitude"
                @keydown.enter="handleSave"
                @keydown.esc="cancel"
              />
            </div>

            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Longitude</label>
              <InputNumber
                v-model="coordinates.longitude"
                class="w-full"
                :min="-180"
                :max="180"
                :step="0.000001"
                :minFractionDigits="6"
                :maxFractionDigits="6"
                placeholder="Longitude"
                @keydown.enter="handleSave"
                @keydown.esc="cancel"
              />
            </div>

            <Button
              v-if="showMapButton"
              icon="pi pi-map"
              class="self-end mb-1"
              text
              @click="openMap"
              v-tooltip="'Open map'"
            />
          </div>

          <div v-if="showAltitude" class="mt-1">
            <label class="block text-xs text-gray-500 mb-1">Altitude (meters)</label>
            <InputNumber
              v-model="coordinates.altitude"
              class="w-full"
              :step="0.01"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              placeholder="Altitude"
              @keydown.enter="handleSave"
              @keydown.esc="cancel"
            />
          </div>

          <div class="flex justify-between items-center mt-2">
            <div v-if="coordinates.latitude !== null && coordinates.longitude !== null" class="text-xs">
              <a
                :href="`https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=15/${coordinates.latitude}/${coordinates.longitude}`"
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
                @click="handleSave"
              />
              <Button
                v-if="nullable"
                icon="pi pi-times"
                size="small"
                text
                severity="danger"
                @click="emit('update:modelValue', null); emit('save', null);"
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
          <Button label="Save Location" icon="pi pi-check" @click="handleSave" />
        </div>
      </template>
    </Dialog>
  </div>
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
