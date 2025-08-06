<script setup lang="ts">

import {formatLat, formatLong} from "~/composables/formatUtils";
import BaseEditableProp from "~/components/app/editable-fields/BaseEditableProp.vue";

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
  originalLatitude: {
    type: [Number, null],
    default: null,
  },
  originalLongitude: {
    type: [Number, null],
    default: null,
  },
  originalAltitude: {
    type: [Number, null],
    default: null,
  },
  isMixed: {
    type: Boolean,
    default: false
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

const edited = computed(() => {
  return props.latitude !== props.originalLatitude
      || props.longitude !== props.originalLongitude
      || (props.showAltitude && props.altitude !== props.originalAltitude);
})

const save = () => {
  if (latitude.value !== props.latitude) {
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

function cancel() {
  showMap.value = false;
  latitude.value = props.latitude ?? null;
  longitude.value = props.longitude ?? null;
  if (props.showAltitude)
    altitude.value = props.altitude ?? null;
}
function reset() {
  showMap.value = false;
  latitude.value = props.originalLatitude ?? null;
  longitude.value = props.originalLongitude ?? null;
  if (props.showAltitude)
    altitude.value = props.originalAltitude ?? null;
  save()
}

</script>

<template>
  <BaseEditableProp
      :value="displayValue"
      :isMixed="isMixed"
      :edited="edited"
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
            :lat-lng="[selectedLat, selectedLng]"/>
      </LMap>
    </div>
    <template #footer>
      <div class="flex justify-between gap-4 w-full">
        <div class="flex gap-2">
          <Button label="Reset" text severity="danger" @click="reset"/>
          <Button label="Cancel" text severity="danger" @click="cancel"/>
        </div>
        <div class="flex justify-content-end gap-5">
          <Button label="Use Current Location" icon="pi pi-map-marker" severity="secondary" @click="useCurrentLocation"/>
          <Button label="Save" icon="pi pi-check" severity="success" @click="saveLocation"/>
        </div>
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

