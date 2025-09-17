import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNoticiasComponent } from './dialog-noticias.component';

describe('DialogNoticiasComponent', () => {
  let component: DialogNoticiasComponent;
  let fixture: ComponentFixture<DialogNoticiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNoticiasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogNoticiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
