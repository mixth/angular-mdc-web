import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChange,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { isBrowser, EventRegistry } from '@angular-mdc/web/common';

import { MdcDrawer, MdcDrawerNavigation } from '../drawer';
import { FOCUSABLE_ELEMENTS } from '../constants';
import { MDCDrawerTemporaryAdapter } from '../adapter';
import { MDCTemporaryDrawerFoundation, util } from '@material/drawer';

@Component({
  moduleId: module.id,
  selector: 'mdc-drawer-temporary',
  template: `
  <mdc-drawer-navigation>
    <ng-content></ng-content>
  </mdc-drawer-navigation>
  `,
  encapsulation: ViewEncapsulation.None,
  providers: [EventRegistry],
  preserveWhitespaces: false,
})
export class MdcDrawerTemporary extends MdcDrawer implements AfterViewInit, OnChanges, OnDestroy {
  @Input() absolute: boolean = false;

  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  @HostBinding('class.mdc-drawer--temporary') isHostClass = true;
  @ViewChild(MdcDrawerNavigation) drawerNav: MdcDrawerNavigation;
  @Input() closeOnClick: boolean = true;
  private get drawerElement(): ElementRef {
    return this.drawerNav && this.drawerNav.elementRef;
  }

  private _mdcAdapter: MDCDrawerTemporaryAdapter = {
    addClass: (className: string) => {
      this.renderer.addClass(this.elementRef.nativeElement, className);
    },
    removeClass: (className: string) => {
      this.renderer.removeClass(this.elementRef.nativeElement, className);
    },
    hasClass: (className: string) => {
      return this.elementRef.nativeElement.classList.contains(className);
    },
    addBodyClass: (className: string) => {
      if (isBrowser()) {
        this.renderer.addClass(document.body, className);
      }
    },
    removeBodyClass: (className: string) => {
      if (isBrowser()) {
        this.renderer.removeClass(document.body, className);
      }
    },
    eventTargetHasClass: (target: HTMLElement, className: string) => {
      return target.classList.contains(className);
    },
    hasNecessaryDom: () => !!this.drawerNav,
    registerInteractionHandler: (evt: string, handler: EventListener) => {
      this._registry.listen(util.remapEvent(evt), handler, this.elementRef.nativeElement);
    },
    deregisterInteractionHandler: (evt: string, handler: EventListener) => {
      this._registry.unlisten(evt, handler);
    },
    registerDrawerInteractionHandler: (evt: string, handler: EventListener) => {
      if (this.drawerElement) {
        this._registry.listen(util.remapEvent(evt), handler, this.drawerElement.nativeElement);
      }
    },
    deregisterDrawerInteractionHandler: (evt: string, handler: EventListener) => {
      this._registry.unlisten(evt, handler);
    },
    registerTransitionEndHandler: (handler: EventListener) => {
      if (this.drawerElement) {
        this._registry.listen('transitionend', handler, this.drawerElement.nativeElement);
      }
    },
    deregisterTransitionEndHandler: (handler: EventListener) => {
      this._registry.unlisten('transitionend', handler);
    },
    registerDocumentKeydownHandler: (handler: EventListener) => {
      if (isBrowser()) {
        this._registry.listen('keydown', handler, document);
      }
    },
    deregisterDocumentKeydownHandler: (handler: EventListener) => {
      this._registry.unlisten('keydown', handler);
    },
    getDrawerWidth: () => {
      return this.drawerNav ? this.drawerNav.elementRef.nativeElement.offsetWidth : 0;
    },
    setTranslateX: (value) => {
      if (this.drawerNav) {
        this.renderer.setProperty(this.drawerNav.elementRef, util.getTransformPropertyName(),
          value === null ? null : `translateX(${value}px)`);
      }
    },
    updateCssVariable: (value: string) => {
      if (util.supportsCssCustomProperties()) {
        this.renderer.setStyle(this.elementRef.nativeElement, '--mdc-temporary-drawer-opacity', value);
      }
    },
    getFocusableElements: () => {
      return this.drawerNav ?
        this.drawerNav.elementRef.nativeElement.querySelectorAll(FOCUSABLE_ELEMENTS) : null;
    },
    saveElementTabState: (el: Element) => {
      util.saveElementTabState(el);
    },
    restoreElementTabState: (el: Element) => {
      util.restoreElementTabState(el);
    },
    makeElementUntabbable: (el: Element) => {
      this.renderer.setAttribute(el, 'tabindex', '-1');
    },
    notifyOpen: () => this.opened.emit(),
    notifyClose: () => this.closed.emit(),
    isRtl: () => {
      return getComputedStyle(this.elementRef.nativeElement).getPropertyValue('direction') === 'rtl';
    },
    isDrawer: (el) => {
      return this.drawerNav ? el === this.drawerNav.elementRef.nativeElement : false;
    }
  };

  private _foundation: {
    init: Function,
    destroy: Function,
    open: Function,
    close: Function,
    isOpen: Function,
  } = new MDCTemporaryDrawerFoundation(this._mdcAdapter);

  constructor(
    public renderer: Renderer2,
    public elementRef: ElementRef,
    private _registry: EventRegistry) {
    super(renderer, elementRef);
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }): void {
    if (changes['absolute']) {
      const absolute = 'ng-mdc-drawer--absolute';
      changes['absolute'].currentValue ? this._mdcAdapter.addClass(absolute) : this._mdcAdapter.removeClass(absolute);
    }
  }

  ngAfterViewInit(): void {
    this._foundation.init();
    this._registry.listen('click', (evt) => {
      if (this.closeOnClick) {
        this._foundation.close();
      }
    }, this.drawerElement.nativeElement);
  }

  ngOnDestroy(): void {
    this._foundation.destroy();
  }

  open(): void {
    this._foundation.open();
  }

  close(): void {
    this._foundation.close();
  }

  isOpen(): boolean {
    return this._foundation.isOpen();
  }

  getDrawerWidth(): number {
    return this._mdcAdapter.getDrawerWidth();
  }

  isRtl(): boolean {
    return this._mdcAdapter.isRtl();
  }
}
