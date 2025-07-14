<script setup lang="ts">

const props = defineProps({
  latitude: {
    type: [Number, null],
    required: true,
  },
  longitude: {
    type: [Number, null],
    required: true,
  },
  altitude: {
    type: [Number, null],
    required: true
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

const emit = defineEmits(['update:latitude', 'update:longitude', 'update:altitude', 'save']);

const latitude = ref(props.latitude);
const longitude = ref(props.longitude);
const altitude = ref(props.altitude);
watch(() => props.latitude, (val) => {
  latitude.value = val;
});
watch(() => props.longitude, (val) => {
  longitude.value = val;
});
watch(() => props.altitude, (val) => {
  altitude.value = val;
});

const save = () => {
  if (latitude.value !== props.latitude){
    emit('update:latitude', latitude.value);
  }
  if (longitude.value !== props.longitude) {
    emit('update:longitude', longitude.value);
  }
  if (altitude.value !== props.altitude) {
    emit('update:altitude', altitude.value);
  }
  if (latitude.value !== props.latitude || longitude.value !== props.longitude || altitude.value !== props.altitude) {
    emit('save');
  }
};
const cancel = () => {
  latitude.value = props.latitude ?? null;
  longitude.value = props.longitude ?? null;
  altitude.value = props.altitude ?? null;
};

const displayValue = computed(() => {
  if (!props.latitude === null || props.longitude === null) {
    return null;
  }
  let formatted = `${formatLat(props.latitude)} ${formatLong(props.longitude)}`;
  if (props.showAltitude && props.altitude !== null && props.altitude !== undefined) {
    formatted += ` ${Math.floor(props.altitude)}m`;
  }
  return formatted;
});
const formatCoordinate = (value: number) => {
  const absValue = Math.abs(value);
  const degrees = Math.floor(absValue);
  const minutes = Math.floor((absValue - degrees) * 60);
  const seconds = Math.round((absValue - degrees - minutes / 60) * 3600);
  return `${degrees}°${minutes}'${seconds}"`;
};
const formatLat = (lat: number | null) => {
  if (lat === null) return '∅';
  return `${formatCoordinate(lat)}${lat >= 0 ? 'N' : 'S'}`;
};
const formatLong = (long: number | null) => {
  if (long === null) return '∅';
  return `${formatCoordinate(long)}${long >= 0 ? 'E' : 'W'}`;
};

const showMap = ref(false);
const selectedLat = ref(latitude.value ?? 0);
const selectedLng = ref(longitude.value ?? 0);

watch(showMap, (val) => {
  if (val) {
    selectedLat.value = latitude.value ?? 0;
    selectedLng.value = longitude.value ?? 0;
  }
});

function onMapClick(e: any) {
  selectedLat.value = e.latlng.lat;
  selectedLng.value = e.latlng.lng;
}

async function useCurrentLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    selectedLat.value = pos.coords.latitude;
    selectedLng.value = pos.coords.longitude;
  });
}

function saveLocation() {
  latitude.value = selectedLat.value;
  longitude.value = selectedLng.value;
  emit('update:latitude', selectedLat.value);
  emit('update:longitude', selectedLng.value);
  showMap.value = false;
  emit('save');
}
</script>

<template>
  <BaseEditableProp
      :value="displayValue"
      :title="title"
      @save="save"
      @cancel="cancel"
  >
    <template #input="{ save, cancel }">
      <InputGroup class="rounded-xs">
        <InputNumber
            v-model="latitude"
            size="small"
            :pt="{
              pcInputText: { root: {class: 'py-0.5 px-2 text-sm w-5'}},
            }"
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
            size="small"
            :pt="{
              pcInputText: { root: {class: 'py-0.5 px-2 text-sm w-5'}},
            }"
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
            class="p-0"
            @click="showMap = true"
            v-tooltip="'Open map'"
        />
      </InputGroup>
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
      <LMap
          :zoom="10"
          :center="[selectedLat, selectedLng]"
          :use-global-leaflet="false"
          style="height:100%; width:100%; cursor: default;"
          @click="onMapClick"
      >
        <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
            layer-type="base"
            name="OpenStreetMap"
        />
        <LMarker
            style="cursor: default; pointer-events: none;"
            :lat-lng="[selectedLat, selectedLng]" />
      </LMap>
    </div>
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" icon="pi pi-times" text @click="showMap = false"/>
        <Button label="Use Current Location" icon="pi pi-crosshairs" @click="useCurrentLocation" />
        <Button label="Save Location" icon="pi pi-check" @click="saveLocation"/>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(img.leaflet-marker-icon) {
  pointer-events: none;
}
.map-container {
  border-radius: 4px;
  overflow: hidden;
}
</style>

