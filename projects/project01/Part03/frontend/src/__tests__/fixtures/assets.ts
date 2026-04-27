// Shared fixture file — created on main thread BEFORE Phase 5+6
// Calibration Test #4 dispatches 4 subagents in parallel.
//
// Subagents A and D both import from here. Subagents may EXTEND this
// file with additional fixtures specific to their tests, but must NOT
// redefine these shared exports.

import type { Asset, Label } from '@/api/types';

export const mockPhotoAsset: Asset = {
  assetid: 1001,
  userid: 80001,
  localname: '01degu.jpg',
  bucketkey: 'p_sarkar/uuid-01degu.jpg',
  kind: 'photo',
};

export const mockDocumentAsset: Asset = {
  assetid: 1042,
  userid: 80001,
  localname: 'test.pdf',
  bucketkey: 'p_sarkar/uuid-test.pdf',
  kind: 'document',
};

export const mockAssets: Asset[] = [mockPhotoAsset, mockDocumentAsset];

export const mockLabels: Label[] = [
  { label: 'Animal', confidence: 99 },
  { label: 'Dog', confidence: 92 },
];
