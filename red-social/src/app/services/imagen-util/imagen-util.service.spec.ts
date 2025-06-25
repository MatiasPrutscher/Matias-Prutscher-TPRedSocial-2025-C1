import { TestBed } from '@angular/core/testing';

import { ImagenUtilService } from './imagen-util.service';

describe('ImagenUtilService', () => {
  let service: ImagenUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagenUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
