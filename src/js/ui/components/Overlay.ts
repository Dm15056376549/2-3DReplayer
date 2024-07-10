import { Panel } from './Panel';
import { ElProps, UIUtil } from '../../utils/UIUtil';

/**
 * The Overlay class definition.
 *
 * The Overlay abstracts
 *
 * @author Stefan Glaser
 */
class Overlay extends Panel
{
  /** The inner overlay panel. */
  readonly innerElement: HTMLDivElement;

  /**
   * Overlay Constructor
   *
   * @param props the element properties
   * @param hideOnClick true if clicking on inner panel should cause the overlay to close, false if not (default: false)
   */
  constructor (props: ElProps = undefined, hideOnClick: boolean = false)
  {
    super({cls: 'overlay full-size'});

    this.innerElement = UIUtil.el('div', props);
    this.domElement.appendChild(this.innerElement);

    const scope = this;

    const hideOverlay = function(event: Event) {
      scope.setVisible(false);
      event.stopPropagation();
    };

    // Add mouse and touch listener
    this.domElement.addEventListener('mousedown', hideOverlay);
    this.domElement.addEventListener('ontouchstart', hideOverlay);

    if (!hideOnClick) {
      this.innerElement.addEventListener('mousedown', UIUtil.StopEventPropagationListener);
      this.innerElement.addEventListener('ontouchstart', UIUtil.StopEventPropagationListener);
    }

    this.setVisible(false);
  }
}

export { Overlay };
