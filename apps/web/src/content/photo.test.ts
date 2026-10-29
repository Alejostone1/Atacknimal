import { describe, expect, it } from 'vitest';
import { photoSet } from './photo.ts';

describe('photoSet', () => {
  it('ofrece los anchos estándar de Commons sin pasar del original', () => {
    const set = photoSet(
      {
        provider: 'wikimedia-commons',
        imageUrl: 'https://upload.wikimedia.org/commons/thumb/a/ab/Lobo.jpg/1280px-Lobo.jpg',
        thumbnailUrl: 'https://upload.wikimedia.org/commons/thumb/a/ab/Lobo.jpg/500px-Lobo.jpg',
        width: 1600,
      },
      '45vw',
    );
    expect(set.src).toContain('/500px-');
    expect(set.srcSet?.split(', ').map((c) => c.split(' ')[1])).toEqual([
      '330w',
      '500w',
      '960w',
      '1280w',
    ]);
    expect(set.srcSet).toContain('/960px-Lobo.jpg 960w');
  });

  it('usa los tamaños publicados por iNaturalist', () => {
    const set = photoSet(
      {
        provider: 'inaturalist',
        imageUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg',
        thumbnailUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/1/medium.jpeg',
        width: 2048,
      },
      '96px',
    );
    expect(set.srcSet).toBe(
      [
        'https://inaturalist-open-data.s3.amazonaws.com/photos/1/medium.jpeg 500w',
        'https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg 1024w',
        'https://inaturalist-open-data.s3.amazonaws.com/photos/1/original.jpeg 2048w',
      ].join(', '),
    );
  });
});
