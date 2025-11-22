import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRegistros } from './crear-registros';

describe('CrearRegistros', () => {
  let component: CrearRegistros;
  let fixture: ComponentFixture<CrearRegistros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRegistros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRegistros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
