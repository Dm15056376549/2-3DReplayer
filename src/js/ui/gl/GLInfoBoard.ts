import { Panel } from '../components/Panel';
import { FPSMeter } from '../../utils/FPSMeter';
import { UIUtil } from '../../utils/UIUtil';

class GLInfoBoard extends Panel
{
  /** The FPS meter instance. */
  readonly fpsMeter: FPSMeter;

  /** The FPS label. */
  readonly fpsLbl: HTMLSpanElement;

  // /** The reosultion label. */
  // readonly resolutionLbl: HTMLSpanElement;

  /**
   * GLInfoBoard Constructor
   *
   * @param fpsMeter the fps meter used by the gl panel
   */
  constructor (fpsMeter: FPSMeter)
  {
    super({cls: 'jsm-gl-info no-text-select'});

    this.fpsMeter = fpsMeter;
    this.fpsMeter.onNewSecond = this.handleNewSecond.bind(this);

    const list = UIUtil.el('ul', { parent: this.domElement });

    const item = UIUtil.el('li', { parent: list });
    UIUtil.el('span', { parent: item, content: 'FPS:', cls: 'label' });
    this.fpsLbl = UIUtil.el('span', { parent: item, content: '0' });

    // item = UIUtil.el('li', { parent: list });
    // UIUtil.el('span', { parent: item, content: 'Resolution:', cls: 'label' });
    // this.resolutionLbl = UIUtil.el('span', { parent: item, content: '0 x 0px' });
  }

  /**
   * Set the fps label.
   *
   * @param fps the current fps
   */
  setFPS (fps: number): void
  {
    this.fpsLbl.innerHTML = fps.toString();
  }

  // /**
  //  * Set the fps label.
  //  *
  //  * @param width the monitor width
  //  * @param height the monitor height
  //  */
  // setResolution (width: number, height: number): void
  // {
  //   this.resolutionLbl.innerHTML = '' + width + ' x ' + height + 'px';
  // }

  /**
   * FPSMeter->"onNewSecond" event listener.
   */
  handleNewSecond (): void
  {
    this.fpsLbl.innerHTML = this.fpsMeter.fpsHistory[0].toString();
  }
}

export { GLInfoBoard };
