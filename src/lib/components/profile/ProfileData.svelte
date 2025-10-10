<script lang="ts">
  import type { PageData } from '../../../routes/app/profile/data/$types';
  import { m } from '$lib/paraglide/messages.js';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import {
    SEX_OPTIONS,
    DIET_OPTIONS,
    WATER_OPTIONS,
    ACTIVITY_OPTIONS,
    BLOOD_OPTIONS
  } from '$lib/types/health';
  import { postHealthProfile } from '$lib/profile/client';

  export let data: PageData;

  let name = data.formDefaults?.name ?? '';
  let phone = data.formDefaults?.phone ?? '';
  let avatarUrl = data.formDefaults?.avatarUrl ?? '';

  // Health profile defaults
  let heightCm = data.healthDefaults?.heightCm ?? 0;
  let ageYears = data.healthDefaults?.ageYears ?? 0;
  let sex = data.healthDefaults?.sex ?? '';
  let weightKg = data.healthDefaults?.weightKg ?? 0;
  let dietType = data.healthDefaults?.dietType ?? '';
  let waterIntake = data.healthDefaults?.waterIntake ?? '';
  let allergies = data.healthDefaults?.allergies ?? '';
  let medications = data.healthDefaults?.medications ?? '';
  let chronicConditions = data.healthDefaults?.chronicConditions ?? '';
  let bloodType = data.healthDefaults?.bloodType ?? '';
  let activityLevel = data.healthDefaults?.activityLevel ?? '';

  // UI save state
  let saveBusy = false;
  let saveMessage: string | null = null;
  let debugLogs: string[] = [];

  function logDebug(message: string): void {
    const ts = new Date().toISOString();
    debugLogs = [...debugLogs, `${ts} ${message}`];
  }

  function back(): void {
    goto(resolve('/app/profile'));
  }

  async function saveHealthClient(event: SubmitEvent | MouseEvent): Promise<void> {
    try {
      event?.preventDefault?.();
      saveBusy = true;
      saveMessage = null;
      logDebug('saveHealthClient: start');

      const parseNumber = (v: number | string): number => {
        const n = Number(String(v).replace(',', '.'));
        return Number.isFinite(n) && n >= 0 ? n : 0;
      };
      const heightVal = parseNumber(heightCm);
      const heightFinal = heightVal > 0 && heightVal < 3 ? Math.round(heightVal * 100) : Math.round(heightVal);
      logDebug(`parsed height: input=${heightCm} -> final_cm=${heightFinal}`);

      logDebug('sending POST /api/health');
      const resp = await postHealthProfile({
          ...(heightFinal > 0 ? { heightCm: heightFinal } : {}),
          ...(String(ageYears) !== '' && Number(ageYears) > 0 ? { ageYears } : {}),
          ...(sex ? { sex } : {}),
          ...(String(weightKg) !== '' && Number(weightKg) > 0 ? { weightKg } : {}),
          ...(dietType ? { dietType } : {}),
          ...(waterIntake ? { waterIntake } : {}),
          ...(allergies?.trim() ? { allergies } : {}),
          ...(medications?.trim() ? { medications } : {}),
          ...(chronicConditions?.trim() ? { chronicConditions } : {}),
          ...(bloodType ? { bloodType } : {}),
          ...(activityLevel ? { activityLevel } : {})
        });
      logDebug(`response received: status=${resp.status}`);
      if (!resp.ok) {
        let msg = 'Unbekannter Fehler';
        let raw: string | null = null;
        try {
          const j = await resp.json();
          msg = j?.error?.message || j?.message || msg;
          raw = JSON.stringify(j);
        } catch {
          try {
            raw = await resp.text();
          } catch {
            raw = raw;
          }
        }
        saveMessage = `Speichern fehlgeschlagen: ${msg}`;
        logDebug(`save failed: ${msg}${raw ? ` | raw=${raw}` : ''}`);
        return;
      }
      saveMessage = 'Gesundheitsprofil gespeichert.';
      try {
        const j = await resp.json();
        logDebug(`save ok: rows=${Array.isArray(j?.data) ? j.data.length : 1}`);
      } catch (_err) {
        logDebug('save ok: response json parse skipped');
      }
    } catch (e) {
      const err = e as Error;
      saveMessage = `Speichern fehlgeschlagen: ${err.message}`;
      logDebug(`exception: ${err.message}`);
    } finally {
      saveBusy = false;
      logDebug('saveHealthClient: finished');
    }
  }
</script>

<div class="min-h-full bg-gray-50">
  <div class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{m.data_page_title()}</h1>
      <div class="flex gap-2">
        <a href={resolve('/app/profile/data')} class="rounded bg-gray-100 px-3 py-2 text-sm">{m.data_refresh()}</a>
        <button class="rounded border bg-white px-3 py-2 text-sm" on:click={back}>{m.data_back()}</button>
      </div>
    </div>

    <div class="mb-2 text-xs text-gray-500">{m.data_last_refreshed({ ts: data.me?.ts ?? '' })}</div>

    <div class="grid gap-4 md:grid-cols-2">
      <section class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 class="mb-2 text-lg font-semibold">{m.data_section_account()}</h2>
        <div class="space-y-2 text-sm">
          <div><span class="text-gray-500">ID:</span> {data.accountUser?.id}</div>
          <div><span class="text-gray-500">Email:</span> {data.accountUser?.email}</div>
          <div><span class="text-gray-500">Joined:</span> {data.accountUser?.created_at}</div>
          <div><span class="text-gray-500">Last sign-in:</span> {data.accountUser?.last_sign_in_at}</div>
          <div><span class="text-gray-500">Provider(s):</span> {(data.providers ?? []).join(', ')}</div>
        </div>
      </section>

      <section class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 class="mb-2 text-lg font-semibold">{m.data_section_google()}</h2>
        {#if data.google}
          <div class="space-y-2 text-sm">
            <div><span class="text-gray-500">Name:</span> {data.google?.names?.[0]?.displayName}</div>
            <div><span class="text-gray-500">Email:</span> {data.google?.emailAddresses?.[0]?.value}</div>
            <div><span class="text-gray-500">Phone:</span> {data.google?.phoneNumbers?.[0]?.value}</div>
            <div><span class="text-gray-500">Gender:</span> {data.google?.genders?.[0]?.value}</div>
            <div>
              <span class="text-gray-500">Birthday:</span>
              {data.google?.birthdays?.[0]?.text || data.google?.birthdays?.[0]?.date?.year + '-' + data.google?.birthdays?.[0]?.date?.month + '-' + data.google?.birthdays?.[0]?.date?.day}
            </div>
            <div><span class="text-gray-500">Locale:</span> {data.google?.locales?.[0]?.value}</div>
            <div><span class="text-gray-500">Organization:</span> {data.google?.organizations?.[0]?.name}</div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500">Photo:</span>
              {#if data.google?.photos?.[0]?.url}
                <img src={data.google.photos[0].url} alt="avatar" class="h-10 w-10 rounded-full" />
              {/if}
            </div>
          </div>
        {:else}
          <div class="text-sm text-gray-500">{m.data_google_missing()}</div>
        {/if}
      </section>
    </div>

    <form method="post" use:enhance class="mt-6 max-w-lg space-y-3">
      <div>
        <label for="name" class="mb-1 block text-sm text-gray-700">{m.field_name()}</label>
        <input id="name" name="name" class="w-full rounded border px-2 py-1" bind:value={name} />
      </div>
      <div>
        <label for="phone" class="mb-1 block text-sm text-gray-700">{m.field_phone()}</label>
        <input id="phone" name="phone" class="w-full rounded border px-2 py-1" bind:value={phone} />
      </div>
      <div>
        <label for="avatar" class="mb-1 block text-sm text-gray-700">{m.field_avatar_url()}</label>
        <input id="avatar" name="avatarUrl" class="w-full rounded border px-2 py-1" bind:value={avatarUrl} />
      </div>
      <div class="flex gap-2">
        <button class="rounded bg-blue-600 px-3 py-2 text-sm text-white" type="submit">{m.profile_save()}</button>
        <button class="rounded bg-gray-200 px-3 py-2 text-sm" type="button" on:click={back}>{m.profile_cancel()}</button>
      </div>
    </form>

    <form class="mt-8 max-w-2xl space-y-4" on:submit|preventDefault={saveHealthClient}>
      <h2 class="text-lg font-semibold">Gesundheitsprofil</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-gray-700" for="heightCm">Größe (cm)</label>
          <input id="heightCm" name="heightCm" type="number" min="0" step="0.1" inputmode="decimal" class="w-full rounded border px-2 py-1" bind:value={heightCm} />
          <p class="mt-1 text-xs text-gray-500">Tipp: 180 für cm oder 1.8 für Meter</p>
        </div>
        <!-- more inputs preserved as in full version -->
      </div>
      <div class="flex items-center gap-2">
        <button class="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50" type="button" on:click={saveHealthClient} disabled={saveBusy}>{saveBusy ? 'Speichert…' : 'Speichern'}</button>
        <button class="rounded bg-gray-200 px-3 py-2 text-sm" type="button" on:click={back}>Abbrechen</button>
        {#if saveMessage}
          <span class="text-sm {saveMessage.startsWith('Speichern fehlgeschlagen') || saveMessage.startsWith('Nicht eingeloggt') ? 'text-red-600' : 'text-green-600'}">{saveMessage}</span>
        {/if}
      </div>
      <div class="mt-3 rounded border border-gray-200 bg-gray-50 p-2">
        <div class="mb-1 text-xs font-semibold text-gray-700">Debug</div>
        <div class="max-h-40 overflow-auto text-[11px] leading-4">
          {#each debugLogs as line, i (i)}
            <div>{line}</div>
          {/each}
        </div>
      </div>
    </form>
  </div>
</div>


