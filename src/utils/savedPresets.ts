/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserPreset {
  id: string;
  name: string;
  customBg: string;
  customFg: string;
  brightness: number;
  contrast: number;
  grayscale: boolean;
  hueRotate: number;
}

const PRESETS_STORAGE_KEY = 'inkshift_user_presets';
const PRESETS_COOKIE_KEY = 'inkshift_user_presets';

// Helper to set a cookie
function setCookie(name: string, value: string, days = 365) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    // Using Path=/ and SameSite=Lax for compatibility
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  } catch (err) {
    console.error('Error setting cookie:', err);
  }
}

// Helper to get a cookie
function getCookie(name: string): string | null {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  } catch (err) {
    console.error('Error getting cookie:', err);
  }
  return null;
}

// Load presets from both cookie and localStorage, merging/syncing them
export function getUserPresets(): UserPreset[] {
  let presetsFromStorage: UserPreset[] = [];
  let presetsFromCookie: UserPreset[] = [];

  // 1. Try LocalStorage
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      presetsFromStorage = JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error reading presets from localStorage:', err);
  }

  // 2. Try Cookie
  try {
    const cookieVal = getCookie(PRESETS_COOKIE_KEY);
    if (cookieVal) {
      presetsFromCookie = JSON.parse(cookieVal);
    }
  } catch (err) {
    console.error('Error reading presets from cookie:', err);
  }

  // 3. Merge lists by ID, giving preference to storage as it handles special chars easily
  const mergedMap = new Map<string, UserPreset>();
  presetsFromCookie.forEach((p) => {
    if (p && p.id && p.name) mergedMap.set(p.id, p);
  });
  presetsFromStorage.forEach((p) => {
    if (p && p.id && p.name) mergedMap.set(p.id, p);
  });

  const merged = Array.from(mergedMap.values());

  // 4. Ensure they are in sync
  if (merged.length > 0) {
    syncPresetsToStorage(merged);
  }

  return merged;
}

// Sync presets to both localStorage and cookie
function syncPresetsToStorage(presets: UserPreset[]) {
  const serialized = JSON.stringify(presets);
  
  // Save to LocalStorage
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Error saving presets to localStorage:', err);
  }

  // Save to Cookie (truncate if it exceeds cookie limits just in case)
  try {
    if (serialized.length < 4000) {
      setCookie(PRESETS_COOKIE_KEY, serialized);
    } else {
      // If too many presets, serialize a trimmed down list for cookie
      const trimmed = presets.slice(0, 10);
      setCookie(PRESETS_COOKIE_KEY, JSON.stringify(trimmed));
    }
  } catch (err) {
    console.error('Error saving presets to cookie:', err);
  }
}

// Add/Save a user preset
export function saveUserPreset(preset: UserPreset): UserPreset[] {
  const presets = getUserPresets();
  const existingIndex = presets.findIndex((p) => p.id === preset.id);
  
  if (existingIndex > -1) {
    presets[existingIndex] = preset;
  } else {
    presets.push(preset);
  }

  syncPresetsToStorage(presets);
  return presets;
}

// Delete a user preset
export function deleteUserPreset(id: string): UserPreset[] {
  const presets = getUserPresets();
  const filtered = presets.filter((p) => p.id !== id);
  syncPresetsToStorage(filtered);
  return filtered;
}
