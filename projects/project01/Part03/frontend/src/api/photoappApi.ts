import type {
  ApiEnvelope,
  Asset,
  Label,
  PingData,
  SearchHit,
  User,
} from './types';

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  if (body.message === 'success') return body.data;
  throw new Error(body.error);
}

export async function getPing(): Promise<PingData> {
  const res = await fetch('/api/ping');
  return unwrap<PingData>(res);
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  return unwrap<User[]>(res);
}

export async function getImages(userid?: number): Promise<Asset[]> {
  const url = userid !== undefined ? `/api/images?userid=${userid}` : '/api/images';
  const res = await fetch(url);
  return unwrap<Asset[]>(res);
}

export async function uploadImage(userid: number, file: File): Promise<{ assetid: number }> {
  const fd = new FormData();
  fd.append('userid', String(userid));
  fd.append('file', file);
  const res = await fetch('/api/images', { method: 'POST', body: fd });
  return unwrap<{ assetid: number }>(res);
}

export function getImageFileUrl(assetid: number): string {
  return `/api/images/${assetid}/file`;
}

export async function getImageLabels(assetid: number): Promise<Label[]> {
  const res = await fetch(`/api/images/${assetid}/labels`);
  return unwrap<Label[]>(res);
}

export async function searchImages(label: string): Promise<SearchHit[]> {
  const res = await fetch(`/api/search?label=${encodeURIComponent(label)}`);
  return unwrap<SearchHit[]>(res);
}

export async function deleteAllImages(): Promise<{ deleted: true }> {
  const res = await fetch('/api/images', { method: 'DELETE' });
  return unwrap<{ deleted: true }>(res);
}
