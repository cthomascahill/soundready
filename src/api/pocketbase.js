import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// Disable auto-cancellation so concurrent requests don't cancel each other
pb.autoCancellation(false);
