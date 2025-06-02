import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComprarPage } from './comprar.page';

describe('ComprarPage', () => {
  let component: ComprarPage;
  let fixture: ComponentFixture<ComprarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComprarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
