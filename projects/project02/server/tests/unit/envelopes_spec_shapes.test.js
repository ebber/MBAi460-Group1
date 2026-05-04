// Approach 01-foundation.md § Phase 8 Task 8.1
// Surface-specific acceptance tests: assert the library's envelope helpers
// produce the exact spec-required envelope for each Project 02 route family.
// CL9 note: library's successResponse() was made variadic in this phase;
// these tests lock the contract from the consumer's perspective.
const { schemas } = require('@mbai460/photoapp-server');
const { successResponse, errorResponse } = schemas.envelopes;

describe('successResponse — Project 02 route family shapes', () => {
  test('/ping: {message, M, N}', () => {
    expect(successResponse({ M: 5, N: 10 })).toEqual({ message: 'success', M: 5, N: 10 });
  });

  test('/users: {message, data: [...users]}', () => {
    const users = [
      { userid: 80001, fname: 'Alice', lname: 'B', email: 'a@b.com', bucketfolder: 'f' },
    ];
    expect(successResponse({ data: users })).toEqual({ message: 'success', data: users });
  });

  test('/images: {message, data: [...images]}', () => {
    const images = [{ assetid: 1, userid: 80001, assetname: 'img.jpg' }];
    expect(successResponse({ data: images })).toEqual({ message: 'success', data: images });
  });

  test('/image/:userid upload: {message, assetid}', () => {
    expect(successResponse({ assetid: 42 })).toEqual({ message: 'success', assetid: 42 });
  });

  test('/image/:assetid download: {message, userid, local_filename, data}', () => {
    const env = successResponse({ userid: 80001, local_filename: 'img.jpg', data: 'base64string' });
    expect(env).toEqual({
      message: 'success',
      userid: 80001,
      local_filename: 'img.jpg',
      data: 'base64string',
    });
  });

  test('/image_labels/:assetid: {message, data: [...labels]}', () => {
    const labels = [{ label: 'dog', confidence: 99.5 }];
    expect(successResponse({ data: labels })).toEqual({ message: 'success', data: labels });
  });

  test('/images_with_label/:label: {message, data: [...images]}', () => {
    const images = [{ assetid: 7 }];
    expect(successResponse({ data: images })).toEqual({ message: 'success', data: images });
  });
});

describe('errorResponse — Project 02 error envelope shapes', () => {
  test('{message:"error", error:"<msg>"} basic shape', () => {
    expect(errorResponse('no such userid')).toEqual({ message: 'error', error: 'no such userid' });
  });

  test('extras spread into error envelope (for spec-required placeholder fields)', () => {
    expect(errorResponse('no such assetid', { assetid: -1 })).toEqual({
      message: 'error',
      error: 'no such assetid',
      assetid: -1,
    });
  });
});
