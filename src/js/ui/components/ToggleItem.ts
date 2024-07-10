import { SingleChoiceItem } from './SingleChoiceItem';

class ToggleItem extends SingleChoiceItem
{
  /**
   * ToggleItem Constructor
   *
   * @param name the name to display
   * @param on the label title on the on choice
   * @param off the label title on the off choice
   * @param state the initial state of the item (true: on, false: off (default))
   * @param itemClass the css class string
   */
  constructor (name: string, on: string, off: string, state: boolean = false, itemClass: string | undefined = undefined)
  {
    super(name, [on, off], state ? 0 : 1, 'toggle-item' + (itemClass === undefined ? '' : ' ' + itemClass));

    // Add item onclick listener
    this.domElement.onclick = this.toggle.bind(this);
  }

  /**
   * Check if this toggle item is active (on) or not (off).
   * 
   * @returns true, if the toggle item is in "on" state, false otherwise
   */
  isOn (): boolean
  {
    return this.userOptions[0].checked == true;
  }

  /**
   * @override
   */
  onFormChangeListener (): void
  {
    if (this.onChanged) {
      this.onChanged();
    }
  }

  /**
   * Toggle the state of this item.
   */
  toggle (): void
  {
    const wasOn = this.isOn();
    if (wasOn) {
      this.userOptions[1].checked = true;
    } else {
      this.userOptions[0].checked = true;
    }

    if (this.onChanged) {
      this.onChanged();
    }
  }

  /**
   * Toggle the state of this item.
   *
   * @param on true if the toggle item is on, false if off
   */
  setState (on: boolean): void
  {
    const wasOn = this.isOn();
    if (on) {
      this.userOptions[0].checked = true;
    } else {
      this.userOptions[1].checked = true;
    }

    if (on !== wasOn && this.onChanged !== undefined) {
      this.onChanged();
    }
  }
}

export { ToggleItem };
