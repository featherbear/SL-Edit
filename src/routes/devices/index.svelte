<script context="module" lang="ts">
  export async function preload(page, session) {
    const existingDevices: DeviceModel[] = this.fetch("data/devices.json")
      .then((r) => r.json())
      .then((j: StorageModel["devices"]) => Object.values(j));

    let deviceScan: ScanResponse = this.fetch("data/scan.json").then((r) =>
      r.json()
    );

    return {
      existingDevices: await existingDevices,
      deviceScan: await deviceScan,
    };
  }
</script>

<script lang="ts">
  import type StorageModel from "src/models/StorageModel";

  export let existingDevices: DeviceModel[];
  export let deviceScan: ScanResponse;

  let newDevices: DiscoveryType[] = [];
  let discoveredDevicesObj: { [uid: string]: DiscoveryType } = {};
  $: {
    newDevices = Object.values(deviceScan.data).filter((d) => !d["id"]);
    discoveredDevicesObj = Object.fromEntries(
      deviceScan.data.map((device) => [device.serial, device])
    );
  }

  import {
    ButtonSet,
    ClickableTile,
    Search,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  let searchTerm = "";

  import { Button } from "carbon-components-svelte";
  import type { ScanResponse } from "../data/scan.json";
  import { onMount } from "svelte";
  import type { DeviceModel } from "src/models/Device";
  import type { DiscoveryType } from "presonus-studiolive-api";
  import RegisterDevice from "./_components/RegisterDevice.svelte";

  import { goto } from "@sapper/app";

  let options = {
    showDiscovered: false,
    showOffline: false,
  };

  let ui: {
    deviceRegister: RegisterDevice;
  } = {
    deviceRegister: null,
  };

  onMount(() => {
    let currentPromise = null;
    setInterval(function () {
      if (currentPromise) {
        console.debug(
          "A device discovery data request is currently executing, skipping new task"
        );
        return;
      }

      currentPromise = this.fetch("data/scan.json")
        .then(async (r) => {
          deviceScan = await r.json();
        })
        .catch((e) => {
          console.error("Could not fetch latest device discovery data");
        })
        .then(() => {
          currentPromise = null;
        });
    }, 3000);
  });
</script>

<ButtonSet>
  <Button
    disabled={newDevices.length === 0}
    on:click={() => (options.showDiscovered = !options.showDiscovered)}
    kind={options.showDiscovered ? "primary" : "secondary"}
    >Show new devices {newDevices.length ? `(${newDevices.length})` : ''}</Button
  >

  <Button
    on:click={() => (options.showOffline = !options.showOffline)}
    kind={options.showOffline ? "primary" : "secondary"}
    >Show offline devices</Button
  >
</ButtonSet>

<Search placeholder="Search devices..." bind:value={searchTerm} />

{#each existingDevices as device (device.id)}
  <Tile>
    {device.sl_opts.friendly_name || device.internals.devicename} ({device
      .internals.serial}) - {discoveredDevicesObj[device.internals.serial]
      ?.ip ?? "Offline"}
  </Tile>
{/each}

{#if options.showDiscovered}
  {#each newDevices as device (device.serial)}
    <ClickableTile
      on:click={() =>
        ui.deviceRegister.doOpen(device, function (deviceID) {
          goto(`devices/${deviceID}`);
          return true;
        })}
    >
      <Tag type="cyan">NEW</Tag>
      {device.name} ({device.serial}) - {device.ip}
    </ClickableTile>
  {/each}
{/if}

<RegisterDevice bind:this={ui.deviceRegister} />
