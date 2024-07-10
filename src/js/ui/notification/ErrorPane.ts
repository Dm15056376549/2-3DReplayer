import { Panel } from '../components/Panel';
import { UIUtil } from '../../utils/UIUtil';

/**
 * The ErrorOverlay class definition.
 *
 * @author Stefan Glaser
 */
class ErrorOverlay extends Panel
{
  /** The error message label. */
  errorLbl: HTMLSpanElement;

  /**
   * ErrorOverlay Constructor
   */
  constructor ()
  {
    super({cls: 'jsm-error-pane full-size'});

    // Create title and error label
    UIUtil.el('span', { parent: this.domElement, content: 'Error...', cls: 'title' });
    this.errorLbl = UIUtil.el('span', { parent: this.domElement, content: 'n/a', cls: 'error' });
  }

  /**
   * Set the error message to display and show/hide the component.
   *
   * @param message the error message to display, or undefined to clear the last error and hide the component
   */
  setErrorMessage (message: string | undefined = undefined)
  {
    if (message) {
      this.errorLbl.innerHTML = message;
      this.setVisible(true);
    } else {
      this.setVisible(false);
    }
  }
}

export { ErrorOverlay };
