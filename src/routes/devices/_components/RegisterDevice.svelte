<script lang="ts">
  import {
    Modal,
    ProgressBar,
    TextInput,
    ToastNotification,
  } from "carbon-components-svelte";
  import type { DiscoveryType } from "presonus-studiolive-api";
  import type { RegistrationParameters, RegistrationResponse } from "..";

  let open = false;
  let isProcessing = false;
  let errorMessage = "";

  type CallbackType = (deviceID: string) => boolean | void;

  let selectedDevice: DiscoveryType;
  let callback: CallbackType = null;

  let options = {
    friendly_name: "",
  };

  /**
   *
   * @param device Discovered device data
   * @param successCallback Function which takes the created device ID, returns boolean indicating whether the modal should close
   */
  export function doOpen(
    device: DiscoveryType,
    successCallback?: CallbackType
  ) {
    selectedDevice = device;
    callback = successCallback;
    options.friendly_name = selectedDevice.name;

    open = true;
  }

  async function submit() {
    if (isProcessing) return;

    try {
      isProcessing = true;
      errorMessage = "";
      let result: RegistrationResponse = await fetch("devices", {
        method: "POST",
        body: JSON.stringify({
          serial: selectedDevice.serial,
          friendly_name: options.friendly_name?.trim(),
        } as RegistrationParameters),
        headers: { "Content-Type": "application/json" },
      }).then((r) => r.json());

      if (result.status === false) {
        console.error((errorMessage = result.error));
      } else if (callback?.(result.deviceID)) {
        open = false;
      }
    } finally {
      isProcessing = false;
    }
  }
</script>

{#if selectedDevice}
  <Modal
    bind:open
    modalHeading="Add new device"
    primaryButtonText="Add device"
    secondaryButtonText="Cancel"
    on:click:button--primary={() => submit()}
    on:click:button--secondary={() => (open = false)}
    on:open
    on:close
    on:submit
  >
    <div>
      <p>You are about to add a {selectedDevice.name} device</p>
    </div>

    <div>
      <p>Serial: {selectedDevice.serial}</p>
      <p>Address: {selectedDevice.ip}:{selectedDevice.port}</p>
    </div>

    <TextInput
      labelText="Friendly name"
      placeholder="Enter a friendly device name"
      bind:value={options.friendly_name}
    />

    {#if errorMessage}
      <ToastNotification title="Error" subtitle={errorMessage} />
    {/if}

    {#if isProcessing}
      <ProgressBar />
    {/if}
  </Modal>
{/if}

<style lang="scss">
  div {
    margin-bottom: 1em;
  }
</style>
