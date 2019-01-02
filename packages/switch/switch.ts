import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Optional,
  OnDestroy,
  Output,
  Provider,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { toBoolean } from '@angular-mdc/web/common';
import { MdcRipple } from '@angular-mdc/web/ripple';

import { MdcFormField, MdcFormFieldControl } from '@angular-mdc/web/form-field';

import { MDCSwitchFoundation } from '@material/switch/index';

export const MDC_SWITCH_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdcSwitch),
  multi: true
};

/** Change event object emitted by MdcSwitch. */
export class MdcSwitchChange {
  constructor(
    /** The source MdcSwitch of the event. */
    public source: MdcSwitch,
    /** The new `checked` value of the switch. */
    public checked: boolean) { }
}

let nextUniqueId = 0;

@Component({
  moduleId: module.id,
  selector: 'mdc-switch',
  host: {
    '[id]': 'id',
    '[tabIndex]': 'tabIndex',
    'class': 'mdc-switch',
    '[class.mdc-switch--checked]': 'checked',
    '[class.mdc-switch--disabled]': 'disabled'
  },
  template: `
  <div class="mdc-switch__track"></div>
  <div #thumbUnderlay class="mdc-switch__thumb-underlay">
    <div class="mdc-switch__thumb">
      <input type="checkbox"
        #input
        role="switch"
        class="mdc-switch__native-control"
        [id]="inputId"
        [name]="name"
        [tabIndex]="tabIndex"
        [disabled]="disabled"
        [checked]="checked"
        (click)="onInputClick($event)"
        (blur)="onBlur()"
        (change)="onChange($event)"/>
    </div>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    MDC_SWITCH_CONTROL_VALUE_ACCESSOR,
    { provide: MdcFormFieldControl, useExisting: MdcSwitch },
    MdcRipple
  ]
})
export class MdcSwitch implements MdcFormFieldControl<any>, AfterViewInit, ControlValueAccessor, OnDestroy {
  private _uniqueId: string = `mdc-switch-${++nextUniqueId}`;

  @Input() id: string = this._uniqueId;
  @Input() name: string | null = null;

  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) {
    this.setChecked(value);
  }
  private _checked: boolean = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this.setDisabledState(value);
  }
  private _disabled: boolean = false;

  /** The value attribute of the native input element */
  @Input() value: string | null = null;

  @Input() tabIndex: number = 0;
  @Output() readonly change: EventEmitter<MdcSwitchChange> = new EventEmitter<MdcSwitchChange>();

  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbUnderlay') thumbUnderlay!: ElementRef<HTMLElement>;

  /** View -> model callback called when value changes */
  _onChange: (value: any) => void = () => { };

  /** View -> model callback called when control has been touched */
  _onTouched = () => { };

  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  private _createAdapter() {
    return {
      addClass: (className: string) => this._getHostElement().classList.add(className),
      removeClass: (className: string) => this._getHostElement().classList.remove(className),
      setNativeControlChecked: (checked: boolean) => this._getInputElement().checked = checked,
      setNativeControlDisabled: (disabled: boolean) => this._getInputElement().disabled = disabled
    };
  }

  private _foundation: {
    init(): void,
    setChecked(checked: boolean): void,
    setDisabled(disabled: boolean): void,
    handleChange(evt: Event): void
  } = new MDCSwitchFoundation(this._createAdapter());

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public ripple: MdcRipple,
    public elementRef: ElementRef<HTMLElement>,
    @Optional() private _parentFormField: MdcFormField) {

    if (this._parentFormField) {
      _parentFormField.elementRef.nativeElement.classList.add('mdc-form-field');
    }
  }

  ngAfterViewInit(): void {
    this._foundation.init();
    this.ripple.init({
      surface: this.thumbUnderlay.nativeElement,
      unbounded: true
    });
  }

  ngOnDestroy(): void {
    this.ripple.destroy();
  }

  onChange(evt: Event): void {
    evt.stopPropagation();

    this._foundation.handleChange(evt);
    this.setChecked(this._getInputElement().checked);
  }

  onInputClick(evt: Event): void {
    evt.stopPropagation();
  }

  onBlur(): void {
    this._onTouched();
  }

  writeValue(value: any): void {
    this.setChecked(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabled(disabled: boolean): void {
    this.setDisabledState(disabled);
  }

  setChecked(checked: boolean): void {
    if (this.disabled) { return; }

    const previousValue = this.checked;

    this._checked = toBoolean(checked);
    this._foundation.setChecked(checked);

    if (previousValue !== null || undefined) {
      this._onChange(this.checked);
      this.change.emit(new MdcSwitchChange(this, this.checked));
    }

    this._changeDetectorRef.markForCheck();
  }

  setDisabledState(disabled: boolean): void {
    this._disabled = toBoolean(disabled);
    this._foundation.setDisabled(disabled);

    this._changeDetectorRef.markForCheck();
  }

  focus(): void {
    this.inputElement.nativeElement.focus();
  }

  /** Retrieves the DOM element of the component input. */
  private _getInputElement(): HTMLInputElement {
    return this.inputElement.nativeElement;
  }

  /** Retrieves the DOM element of the component host. */
  private _getHostElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
