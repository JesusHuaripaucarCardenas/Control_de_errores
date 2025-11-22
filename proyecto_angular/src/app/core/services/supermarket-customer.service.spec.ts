import { TestBed } from '@angular/core/testing';

import { SupermarketCustomerService } from './supermarket-customer.service';

describe('SupermarketCustomerService', () => {
  let service: SupermarketCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupermarketCustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
