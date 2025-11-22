import { TestBed } from '@angular/core/testing';

import { MarketCustomerService } from './market-customer.service';

describe('MarketCustomerService', () => {
  let service: MarketCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketCustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
