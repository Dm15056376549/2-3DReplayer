import { KeyCodes, ColorValues } from '../Constants';
import { Color, Math as TMath } from 'three';


/**
 * Simple interface for element properties.
 * 
 * @author Stefan Glaser
 */
export interface ElProps
{
  parent?: HTMLElement;
  content?: string;
  cls?: string;
  title?: string;
}


/**
 * General user interface namespace, definitions, etc.
 *
 * @author Stefan Glaser
 */
class UIUtil {
  /**
   * Calculate the brightness value of a color.
   *
   * @param color the color to check
   * @returns the brightness value between 0 and 255
   */
  static getBrightness (color: Color): number
  {
    return 255 * Math.sqrt(
        color.r * color.r * 0.241 +
        color.g * color.g * 0.691 +
        color.b * color.b * 0.068);
  }

  /**
   * Retrieve the default foreground color for a given background color.
   *
   * @param color the background color
   * @return the forground color
   */
  static getForegroundColor (color: Color): Color
  {
    return UIUtil.getBrightness(color) < 130 ? new Color(ColorValues.LIGHT_GRAY) : new Color(ColorValues.DARK_GRAY);
  }

  /**
   * Make the given element visible or invisible.
   *
   * @param element the DOM element
   * @param visible true for visible, false for invisible
   */
  static setVisibility (element: HTMLElement, visible: boolean = false): void
  {
    if (visible === undefined || visible) {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  }

  /**
   * Check if the given component is visible.
   *
   * @param element the DOM element
   * @returns true for visible, false for invisible
   */
  static isVisible (element: HTMLElement): boolean
  {
    return element.style.display != 'none';
  }

  /**
   * Toggle the visibility of the given component.
   *
   * @param element the DOM element
   * @returns true, if the element is now visible, false otherwise
   */
  static toggleVisibility (element: HTMLElement): boolean
  {
    if(element.style.display != 'none') {
      element.style.display = 'none';
      return false;
    } else {
      element.style.display = '';
      return true;
    }
  }

  /**
   * Create a new DOM Element.
   * 
   * @param tagName the element tag name
   * @param properties the element properties
   * @returns the new element
   */
  static el<K extends keyof HTMLElementTagNameMap>(tagName: K, properties?: ElProps): HTMLElementTagNameMap[K]
  {
    const newElement = document.createElement(tagName);

    if (properties) {
      if (!!properties.cls) {
        newElement.className = properties.cls;
      }
      
      if (!!properties.content) {
        newElement.innerHTML = properties.content;
      }
      
      if (!!properties.parent) {
        properties.parent.appendChild(newElement);
      }
      
      if (!!properties.title) {
        newElement.title = properties.title;
      }
    }

    return newElement;
  }

  /**
   * Create a new player button input element.
   *
   * @param text the button text
   * @param className the button css class string
   * @param toolTip the button tool tip
   * @param action the button action
   * @param preventDefault prevent the default mouse action
   * @returns the new button input element
   */
  static createPlayerButton (text?: string, className?: string, toolTip?: string, action?: ((ev: MouseEvent | KeyboardEvent) => any), preventDefault: boolean = false): HTMLButtonElement
  {
    const btn = UIUtil.el('button', {content: text, cls: className});

    if (toolTip !== undefined) {
      btn.title = toolTip;
    }

    if (action !== undefined) {
      const keyListener = function () {
        const actionCB = action;

        return function (evt: KeyboardEvent) {
          if (evt.keyCode == KeyCodes.ENTER ||
              evt.keyCode == KeyCodes.SPACE) {
            actionCB(evt);
          }
        };
      }();

      if (preventDefault) {
        const mouseListener = function () {
          const actionCB = action;

          return function (evt: MouseEvent) {
            evt.preventDefault();
            evt.stopPropagation();
            actionCB(evt);
          };
        }();

        btn.addEventListener('mousedown', mouseListener);
      } else {
        btn.addEventListener('mousedown', action);
      }

      btn.addEventListener('keydown', keyListener);
    }

    return btn;
  }

  /**
   * Create a new button input element.
   *
   * @param text the button text
   * @param className the button css class string
   * @param toolTip the button tool tip
   * @param action the button action
   * @returns the new button input element
   */
  static createButton (text?: string, className?: string, toolTip?: string, action?: ((ev: MouseEvent | KeyboardEvent) => any)): HTMLButtonElement
  {
    const btn = UIUtil.el('button', {content: text, cls: className});

    if (toolTip !== undefined) {
      btn.title = toolTip;
    }

    if (action !== undefined) {
      const keyListener = function () {
        const actionCB = action;

        return function (evt: KeyboardEvent) {
          if (evt.keyCode == KeyCodes.ENTER ||
              evt.keyCode == KeyCodes.SPACE) {
            actionCB(evt);
          }
        };
      }();

      btn.addEventListener('click', action);
      btn.addEventListener('keydown', keyListener);
    }

    return btn;
  }

  /**
   * Check if the given event relates to a button action.
   *
   * @param  evt the event instance
   * @returns true, if the event represents a button interaction, false otherwise
   */
  static isButtonAction (evt: MouseEvent | KeyboardEvent): boolean
  {
    if (evt instanceof KeyboardEvent) {
      return evt.keyCode == KeyCodes.ENTER || evt.keyCode == KeyCodes.SPACE;
    } else if (evt instanceof MouseEvent) {
      return evt.button === 0;
    } else {
      return false;
    }
  }

  /**
   * Create a new single choice form element.
   *
   * @param options the options to display
   * @param preSelected the index of the preselected entry
   * @returns the new single choice form
   */
  static createSingleChoiceForm (options: string[], preSelected: number = 0): HTMLFormElement
  {
    const form = UIUtil.el('form', {cls: 'jsm-s-choice'});

    for (let i = 0; i < options.length; ++i) {
      const btnID = TMath.generateUUID();

      const btn = UIUtil.el('input', { parent: form });
      btn.id = btnID;
      btn.type = 'radio';
      btn.name = 'userOptions';
      btn.value = options[i];

      if (i === preSelected) {
        btn.checked = true;
      }

      const label = UIUtil.el('label', { parent: form, content: options[i] });
      label.htmlFor = btnID;
    }

    form.onclick = function(event) { event.stopPropagation(); };

    return form;
  }

  /**
   * Create a new color chooser element.
   *
   * @param value the initial value
   * @param title the tool tip text
   * @param className the css class string
   * @returns the new color chooser input element
   */
  static createColorChooser (value: string, title?: string, className?: string): HTMLInputElement
  {
    const chooser = UIUtil.el('input', { cls: className , title: title});
    chooser.type = 'color';
    chooser.value = value;

    return chooser;
  }

  /**
   * Set the icon of an element.
   *
   * @param element the element to set the icon class on
   * @param iconClass the new icon class
   */
  static setIcon (element: HTMLElement, iconClass: string): void
  {
    const iconClassIdx = element.className.indexOf('icon-');

    if (iconClassIdx === -1) {
      element.className += ' ' + iconClass;
    } else {
      const spaceCharIdx = element.className.indexOf(' ', iconClassIdx);

      //console.log('Classes: ' + element.className + ' || IconIdx: ' + iconClassIdx + ' || SpaceIdx: ' + spaceCharIdx);

      if (spaceCharIdx !== -1) {
        // Intermediate class
        element.className = element.className.slice(0, iconClassIdx) + iconClass + element.className.slice(spaceCharIdx - 1);
      } else {
        // Last class
        element.className = element.className.slice(0, iconClassIdx) + iconClass;
      }

      //console.log('Classes-after: ' + element.className);
    }
  }

  /**
   * Convert the given time into MM:SS.cs format. E.g. 02:14.84
   *
   * @param time the time to convert
   * @param fillZero fill leading zero minutes
   * @returns the time string
   */
  static toMMSScs (time: number, fillZero: boolean = false): string
  {
    const millsNum = Math.round(time * 100);
    let minutes: number | string = Math.floor(millsNum / 6000);
    let seconds: number | string = Math.floor((millsNum - (minutes * 6000)) / 100);
    let mills: number | string = millsNum - (seconds * 100) - (minutes * 6000);

    if (fillZero && minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }
    if (mills < 10) { mills = '0' + mills; }

    return minutes + ':' + seconds + '.<small>' + mills + '</small>';
  }

  /**
   * Convert the given time into MM:SS format. E.g. 02:14
   *
   * @param time the time to convert
   * @param fillZero fill leading zero minutes
   * @returns the time string
   */
  static toMMSS (time: number, fillZero: boolean = false): string
  {
    const secNum = Math.floor(time);
    let minutes: number | string = Math.floor(secNum / 60)
    let seconds: number | string = secNum - (minutes * 60);

    if (fillZero && minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }

    return minutes + ':' + seconds;
  }

  /**
   * Simple event listener function to prevent further event propagation.
   *
   * @param event the event
   */
  static StopEventPropagationListener (event: Event): void
  {
    event.stopPropagation();
  }

  /**
   * Filter a given list of elements by their tag name.
   *
   * @param elements the elements to filter
   * @param tagName the tag name of the elements of interest
   * @returns the elements with the given tag name
   */
  static filterElements (elements: HTMLElement[], tagName: string): HTMLElement[]
  {
    const result: HTMLElement[] = [];

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].nodeName === tagName) {
        result.push(elements[i]);
      }
    }

    return result;
  }

  /**
   * Check if the browser supports a fullscreen mode.
   *
   * @returns true if the browser supports a fullscreen mode, false if not
   */
  static isFullscreenEnabled (): boolean
  {
    return document.fullscreenEnabled;
  }

  /**
   * Check if the browser is currently in fullscreen mode.
   *
   * @returns true if the browser is currently in fullscreen mode, false if not
   */
  static inFullscreen (): boolean
  {
    return !!UIUtil.getFullscreenElement();
  }

  /**
   * Check if the browser supports a fullscreen mode.
   *
   * @return the fullscreen element or undefined if no such element exists
   */
  static getFullscreenElement (): Element | null
  {
    return document.fullscreenElement;
  }

  /**
   * Request fullscreen mode for the given element.
   *
   * @param element the element to request fullscreen for
   */
  static requestFullscreenFor (element: HTMLElement): void
  {
    element.requestFullscreen();
  }

  /**
   * Cancel the fullscreen mode.
   */
  static cancelFullscreen (): void
  {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
}

export { UIUtil };
