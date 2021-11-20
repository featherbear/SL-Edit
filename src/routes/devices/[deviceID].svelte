<script lang="ts" context="module">
  export async function preload(page, session) {
    let l = await this.fetch(`data/device_${page.params.deviceID}.json`);
    if (l.status == 404) {
      return this.error(404, "Device not found");
    }

    return {
      deviceData: await l.json(),
    };
  }
</script>

<script lang="ts">
  import type { DeviceModel } from "src/models/Device";

  export let deviceData: DeviceModel;
</script>

{JSON.stringify(deviceData)}
