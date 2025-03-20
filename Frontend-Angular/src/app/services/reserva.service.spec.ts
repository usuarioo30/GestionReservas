import { TestBed } from '@angular/core/testing';

import { ReservasService } from './reserva.service';

describe('ReservaService', () => {
  let service: ReservasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
