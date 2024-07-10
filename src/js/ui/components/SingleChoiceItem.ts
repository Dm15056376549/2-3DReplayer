import { UIUtil } from '../../utils/UIUtil';
import { Math as TMath } from 'three';

class SingleChoiceItem
{
  /** The form element. */
  readonly domElement: HTMLLIElement;

  /** The single choice form element. */
  readonly form: HTMLFormElement;

  /** The radio button options. */
  readonly userOptions: HTMLInputElement[];

  /** The callback funtion when the selection of this item changed. */
  onChanged: ((idx?: number, value?: string) => any) | undefined;

  /**
   * SingleChoiceItem Constructor
   *
   * @param name the name to display
   * @param options the options to display
   * @param preSelected the index of the preselected entry
   * @param itemClass the css class string
   */
  constructor (name: string, options: string[], preSelected: number = 0, itemClass: string | undefined = undefined)
  {
    this.domElement = UIUtil.el('li', { cls: itemClass });

    // Add a label
    UIUtil.el('span', { parent: this.domElement, content: name });

    // Add a spacer
    UIUtil.el('div', { parent: this.domElement, cls: 'spcaer' });

    // Add a form
    this.form = UIUtil.el('form', { parent: this.domElement, cls: 'jsm-s-choice' });

    // Create options
    this.userOptions = [];
    for (let i = 0; i < options.length; ++i) {
      const btnID = TMath.generateUUID();

      const btn = UIUtil.el('input', { parent: this.form });
      btn.id = btnID;
      btn.type = 'radio';
      btn.name = 'userOptions';
      btn.value = options[i];

      if (i === preSelected) {
        btn.checked = true;
      }

      const label = UIUtil.el('label', { parent: this.form, content: options[i] });
      label.htmlFor = btnID;

      this.userOptions[i] = btn;
    }

    this.form.onclick = function(event) { event.stopPropagation(); };
    this.form.onchange = this.onFormChangeListener.bind(this);

    this.onChanged = undefined;
  }

  /**
   * Change listener callback function for single choice form element.
   */
  onFormChangeListener (): void
  {
    const options = this.userOptions;
    let i = options.length;

    while (i--) {
      if (options[i].checked) {
        if (this.onChanged) {
          this.onChanged(i, options[i].value);
        }
        return;
      }
    }

    if (this.onChanged) {
      this.onChanged();
    }
  }

  /**
   * Select the option with the given index.
   *
   * @param idx the index to select
   */
  selectIndex (idx: number): void
  {
    const option = this.userOptions[idx];

    if (option) {
      option.checked = true;
    }
  }

  /**
   * Select the option with the given value.
   *
   * @param value the value of the checkbox to select
   */
  selectOption (value: string): void
  {
    const options = this.userOptions;
    let i = options.length;

    while (i--) {
      if (options[i].value == value) {
        if (options[i].checked != true) {
          options[i].checked = true;
        }
        return;
      }
    }
  }
}

export { SingleChoiceItem };
