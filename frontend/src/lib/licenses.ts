// What each license lets a buyer do, in plain words (shown on the model page). Summaries, not legal text.
import type { License } from './types';

export interface LicenseInfo {
  name: string;
  summary: string;
  rules: { ok: boolean; text: string }[];
}

export const LICENSE_INFO: Record<License, LicenseInfo> = {
  CC0: {
    name: 'CC0 — Public domain',
    summary: 'No rights reserved. Use it however you like.',
    rules: [
      { ok: true, text: 'Use in personal and commercial projects' },
      { ok: true, text: 'Modify and remix' },
      { ok: true, text: 'No credit needed' },
    ],
  },
  'CC-BY': {
    name: 'CC BY — Attribution',
    summary: 'Free to use if you credit the creator.',
    rules: [
      { ok: true, text: 'Use in personal and commercial projects' },
      { ok: true, text: 'Modify and remix' },
      { ok: false, text: 'Do not leave out the creator credit' },
    ],
  },
  'CC-BY-NC': {
    name: 'CC BY-NC — Non-commercial',
    summary: 'Free for non-commercial use, with credit.',
    rules: [
      { ok: true, text: 'Use in personal and non-profit projects' },
      { ok: true, text: 'Modify and remix, with credit' },
      { ok: false, text: 'No commercial use' },
    ],
  },
  COMMERCIAL: {
    name: 'Commercial license',
    summary: 'Paid license. Use it in commercial work once you own it.',
    rules: [
      { ok: true, text: 'Use in commercial projects after purchase' },
      { ok: true, text: 'Embed with your own embed key' },
      { ok: false, text: 'No reselling or redistributing the file' },
    ],
  },
};
