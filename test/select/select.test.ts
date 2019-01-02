import { Component, DebugElement } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { async, fakeAsync, ComponentFixture, TestBed, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { dispatchKeyboardEvent, dispatchMouseEvent, dispatchTouchEvent } from '../testing/dispatch-events';

import { DOWN_ARROW, MdcSelectModule, MdcSelect, MdcListModule } from '@angular-mdc/web';

describe('MdcSelectModule', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MdcSelectModule, MdcListModule],
      declarations: [
        SimpleTest,
        SelectFormControl,
        EnhancedSelect
      ]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let testDebugElement: DebugElement;
    let testNativeElement: HTMLElement;
    let testInstance: MdcSelect;
    let testComponent: SimpleTest;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTest);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcSelect));
      testNativeElement = testDebugElement.nativeElement;
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('#should have mdc-select by default', () => {
      expect(testDebugElement.nativeElement.classList).toContain('mdc-select');
    });

    it('#should set disabled to true', () => {
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(testInstance.disabled).toBe(true);
    });

    it('#should set floatLabel to false', () => {
      testComponent.floatLabel = false;
      fixture.detectChanges();
      expect(testInstance.floatLabel).toBe(false);
    });

    it('#should set required to true', () => {
      testComponent.required = true;
      fixture.detectChanges();
      expect(testInstance.required).toBe(true);
    });

    it('#should set valid to true', () => {
      testComponent.valid = true;
      fixture.detectChanges();
      expect(testInstance.valid).toBe(true);
    });

    it('#should set outlined and floating label with value', () => {
      testInstance.setSelectionByValue('fruit-3');
      testInstance.outlined = true;
      testInstance.floatLabel = true;
      fixture.detectChanges();

      expect(testInstance.floatLabel).toBe(true);
    });

    it('#should generate a unique id for the select if no id is set', () => {
      expect(testInstance.id).toMatch(/mdc-select-\d+/);
    });

    it('#should have `Please select` as placeholder text', () => {
      testInstance.placeholder = 'Please select';
      fixture.detectChanges();
      expect(testInstance.placeholder).toMatch('Please select');
    });

    it('#should select fruit-3', () => {
      testInstance.setSelectionByValue('fruit-3');
      fixture.detectChanges();
      expect(testInstance.getValue());
    });

    it('#should have no selected options', () => {
      testInstance.setSelectionByValue(null);
      fixture.detectChanges();
      expect(testInstance.getSelectedIndex()).toBe(-1);
    });

    it('#should select fruit-3 by index', () => {
      testInstance.setSelectedIndex(3);
      fixture.detectChanges();
      expect(testInstance.getValue()).toBe('fruit-3');
    });

    it('#should handle mouse events', () => {
      dispatchMouseEvent(testInstance._nativeSelect.nativeElement, 'mousedown');
      fixture.detectChanges();
      testInstance.focus();
      dispatchKeyboardEvent(testInstance.elementRef.nativeElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();
    });

    it('#should handle touch events', () => {
      dispatchTouchEvent(testInstance._nativeSelect.nativeElement, 'touchstart');
      fixture.detectChanges();
    });
  });

  describe('form control basic behaviors', () => {
    let testDebugElement: DebugElement;
    let testNativeElement: HTMLElement;
    let testInstance: MdcSelect;
    let testComponent: SelectFormControl;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectFormControl);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcSelect));
      testNativeElement = testDebugElement.nativeElement;
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;

      fixture.detectChanges();
    });

    it('#should apply class outlined', () => {
      testComponent.outlined = true;
      fixture.detectChanges();
      expect(testDebugElement.nativeElement.classList.contains('mdc-select--outlined')).toBe(true);
    });

    it('#should set value to tacos-2', fakeAsync(() => {
      testComponent.foodControl.setValue('tacos-2');
      flush();

      expect(testInstance.getValue()).toBe('tacos-2');
    }));

    it('should be able to focus the select trigger', fakeAsync(() => {
      document.body.focus(); // ensure that focus isn't on the trigger already
      testInstance.focus();

      expect(document.activeElement).toBe(testInstance._nativeSelect.nativeElement,
        'Expected select element to be focused.');
    }));
  });

  describe('Enhanced select', () => {
    let testDebugElement: DebugElement;
    let testNativeElement: HTMLElement;
    let testInstance: MdcSelect;
    let testComponent: EnhancedSelect;

    beforeEach(() => {
      fixture = TestBed.createComponent(EnhancedSelect);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcSelect));
      testNativeElement = testDebugElement.nativeElement;
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;

      fixture.detectChanges();
    });

    it('#should apply class outlined', fakeAsync(() => {
      testComponent.outlined = true;
      fixture.detectChanges();
      expect(testDebugElement.nativeElement.classList.contains('mdc-select--outlined')).toBe(true);
    }));

    it('#should be disabled', fakeAsync(() => {
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(testInstance.disabled).toBe(true);
    }));

    it('#should handle mouse events', fakeAsync(() => {
      dispatchMouseEvent(testDebugElement.nativeElement, 'mousedown');
      fixture.detectChanges();
      testInstance.focus();
      dispatchKeyboardEvent(testInstance.elementRef.nativeElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      flush();
    }));
  });
});

@Component({
  template: `
    <form #demoSelectForm="ngForm" id="demoSelectForm">
      <mdc-form-field>
        <mdc-select #select placeholder="Favorite food" ngModel #demoSelectModel="ngModel" name="food"
         [disabled]="disabled" [floatLabel]="floatLabel" [required]="required" [valid]="valid"
         [value]="testValue"
         (valueChange)="handleValueChange($event)" (selectionChange)="handleSelectedChange($event)">
          <option *ngFor="let food of foods" [value]="food.value" disabled="food.disabled">
            {{food.description}}
          </option>
        </mdc-select>
        <mdc-helper-text
          [validation]="true"
          [persistent]="false">Meal selection is required
        </mdc-helper-text>
      </mdc-form-field>
    </form>
  `,
})
class SimpleTest {
  myPlaceholder: string = 'Favorite food';
  disabled: boolean = true;
  floatLabel: boolean;
  multiple: boolean;
  required: boolean;
  valid: boolean;
  testValue: string;

  foods = [
    { value: 'steak-0', description: 'Steak' },
    { value: 'pizza-1', description: 'Pizza' },
    { value: 'tacos-2', description: 'Tacos' },
    { value: 'fruit-3', description: 'Fruit', disabled: true },
  ];

  handleValueChange(event: { index: number, value: string }) { }
  handleSelectedChange(event: { index: number, value: string }) { }
}

@Component({
  template: `
  <mdc-select placeholder="Favorite food" [formControl]="foodControl" [autosize]="autosize"
   [outlined]="outlined" (blur)="handleBlur()" [compareWith]="compareFn">
    <option *ngFor="let food of foods" [value]="food.value" disabled="food.disabled">
      {{food.description}}
    </option>
  </mdc-select>
  `,
})
class SelectFormControl {
  foodControl = new FormControl();
  outlined: boolean;
  autosize: boolean = true;

  compareFn(f1: any, f2: any): boolean {
    return f1 && f2 ? f1.id === f2.id : f1 === f2;
  }

  foods = [
    { value: 'steak-0', description: 'Steak' },
    { value: 'pizza-1', description: 'Pizza' },
    { value: 'tacos-2', description: 'Tacos' },
    { value: 'fruit-3', description: 'Fruit', disabled: true },
  ];

  handleBlur: () => void = () => { };
}

@Component({
  template: `
  <mdc-select placeholder="Fruit" [helperText]="enhancedHelper" [disabled]="disabled" [outlined]="outlined">
  <mdc-menu>
    <mdc-list>
      <mdc-list-item selected></mdc-list-item>
      <mdc-list-item value="apple">Apple</mdc-list-item>
      <mdc-list-item value="orange">Orange</mdc-list-item>
      <mdc-list-item value="banana">Banana</mdc-list-item>
    </mdc-list>
  </mdc-menu>
</mdc-select>
<mdc-helper-text #enhancedHelper validation>Field is required</mdc-helper-text>
`
})
class EnhancedSelect {
  outlined: boolean;
  disabled: boolean;

  compareFn(f1: any, f2: any): boolean {
    return f1 && f2 ? f1.id === f2.id : f1 === f2;
  }
}
