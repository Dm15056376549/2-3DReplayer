import { Panel } from '../components/Panel';
import { DnDHandler } from '../utils/DnDHandler';
import { UIUtil } from '../../utils/UIUtil';

/**
 * The WelcomeOverlay class definition.
 *
 * @author Stefan Glaser
 */
class WelcomeOverlay extends Panel
{
  /** The Drag & Drop box for local files. */
  readonly dndBox: HTMLDivElement;

  /**
   * WelcomeOverlay Constructor
   *
   * @param dndHandler the dnd-handler
   */
  constructor (dndHandler: DnDHandler)
  {
    super({cls: 'jsm-welcome-pane full-size'});

    this.dndBox = UIUtil.el('div', {
      parent: this.domElement,
      cls: 'dnd-box',
      content: '<span>Drag &amp; Drop Replays or SServer Logs to Play</span>'
    });

    dndHandler.addListeners(this.dndBox);
  }
}

export { WelcomeOverlay };
