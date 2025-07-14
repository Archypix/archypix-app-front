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
    default: true
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
  let formatted = `${formatLat(props.latitude)} ${formatLat(props.longitude)}°E`;
  if (props.showAltitude && props.altitude !== null && props.altitude !== undefined) {
    formatted += ` ${Math.floor(props.altitude)}m`;
  }
  return formatted;
});
const formatLat = (lat: number | null) => {
  if (lat === null) return '∅';
  const absLat = Math.abs(lat);
  const degrees = Math.floor(absLat);
  const minutes = Math.floor((absLat - degrees) * 60);
  const seconds = ((absLat - degrees - minutes / 60) * 3600).toFixed(2);
  return `${degrees}°${minutes}'${seconds}"${lat >= 0 ? 'N' : 'S'}`;
};

const showMap = ref(false);

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
          :zoom="6"
          :center="[latitude ?? 0, longitude ?? 0]"
          :use-global-leaflet="false"
      >
        <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
            layer-type="base"
            name="OpenStreetMap"
        />
      </LMap>
    </div>
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" icon="pi pi-times" text @click="showMap = false"/>
        <!--        <Button label="Use Current Location" icon="pi pi-crosshairs" @click="handleMapSelect(0, 0)" />-->
        <Button label="Save Location" icon="pi pi-check" @click="save"/>
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
