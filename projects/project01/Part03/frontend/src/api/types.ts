// Shared types for the typed fetch wrapper around `/api/*`.

export interface ApiSuccess<T> {
  message: 'success';
  data: T;
}

export interface ApiError {
  message: 'error';
  error: string;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export interface User {
  userid: number;
  username: string;
  givenname: string;
  familyname: string;
}

export type AssetKind = 'photo' | 'document';

export interface Asset {
  assetid: number;
  userid: number;
  localname: string;
  bucketkey: string;
  kind: AssetKind;
}

export interface Label {
  label: string;
  confidence: number;
}

export interface SearchHit {
  assetid: number;
  label: string;
  confidence: number;
}

export interface PingData {
  s3_object_count: number;
  user_count: number;
}
