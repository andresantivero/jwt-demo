import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetirarPage } from './retirar.page';

describe('RetirarPage', () => {
  let component: RetirarPage;
  let fixture: ComponentFixture<RetirarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RetirarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
