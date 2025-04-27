import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaldoPage } from './saldo.page';

describe('SaldoPage', () => {
  let component: SaldoPage;
  let fixture: ComponentFixture<SaldoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SaldoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
