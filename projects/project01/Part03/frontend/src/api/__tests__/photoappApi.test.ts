import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPing,
  getUsers,
  getImages,
  uploadImage,
  getImageFileUrl,
  getImageLabels,
  searchImages,
  deleteAllImages,
} from '../photoappApi';

describe('photoappApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPing calls /api/ping and returns parsed data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: { s3_object_count: 5, user_count: 3 } }),
    } as Response);
    const data = await getPing();
    expect(fetch).toHaveBeenCalledWith('/api/ping');
    expect(data).toEqual({ s3_object_count: 5, user_count: 3 });
  });

  it('getUsers returns array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'success',
        data: [{ userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' }],
      }),
    } as Response);
    const result = await getUsers();
    expect(fetch).toHaveBeenCalledWith('/api/users');
    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe('p_sarkar');
  });

  it('getImages without userid hits /api/images', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await getImages();
    expect(fetch).toHaveBeenCalledWith('/api/images');
  });

  it('getImages with userid encodes the query param', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await getImages(80001);
    expect(fetch).toHaveBeenCalledWith('/api/images?userid=80001');
  });

  it('uploadImage sends multipart FormData', async () => {
    const file = new File(['fakebytes'], 'test.jpg', { type: 'image/jpeg' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: { assetid: 1001 } }),
    } as Response);
    global.fetch = fetchMock;
    const data = await uploadImage(80001, file);
    expect(data).toEqual({ assetid: 1001 });
    const call = fetchMock.mock.calls[0]!;
    expect(call[0]).toBe('/api/images');
    expect((call[1] as RequestInit).method).toBe('POST');
    expect((call[1] as RequestInit).body).toBeInstanceOf(FormData);
  });

  it('getImageFileUrl returns the right path', () => {
    expect(getImageFileUrl(1001)).toBe('/api/images/1001/file');
  });

  it('getImageLabels parses labels array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [{ label: 'Animal', confidence: 99 }] }),
    } as Response);
    const labels = await getImageLabels(1001);
    expect(labels).toHaveLength(1);
    expect(labels[0]?.confidence).toBe(99);
  });

  it('searchImages encodes label query', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await searchImages('animal');
    expect(fetch).toHaveBeenCalledWith('/api/search?label=animal');
  });

  it('searchImages url-encodes special chars', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: [] }),
    } as Response);
    await searchImages('hi there');
    expect(fetch).toHaveBeenCalledWith('/api/search?label=hi%20there');
  });

  it('deleteAllImages calls DELETE /api/images', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success', data: { deleted: true } }),
    } as Response);
    global.fetch = fetchMock;
    await deleteAllImages();
    const call = fetchMock.mock.calls[0]!;
    expect(call[0]).toBe('/api/images');
    expect((call[1] as RequestInit).method).toBe('DELETE');
  });

  it('throws on error envelope', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'error', error: 'no such userid' }),
    } as Response);
    await expect(uploadImage(99999, new File([], 'x.jpg'))).rejects.toThrow('no such userid');
  });
});
