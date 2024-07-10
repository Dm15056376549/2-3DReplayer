import { EventDispatcher, GEventObject } from '../../utils/EventDispatcher';
import { UIUtil } from '../../utils/UIUtil';

/** The fullscreen manager event map interface. */
export interface FullscreenManagerEventMap {
  'change': GEventObject;
}

/**
 * Helper class for managinf fullscreen modi.
 *
 * @author Stefan Glaser
 */
class FullscreenManager extends EventDispatcher<FullscreenManagerEventMap>
{
  /** The container of interest. */
  readonly container: HTMLElement;

  /** Fullscreen change listener. */
  handleFullscreenChangeListener: (ev: Event) => any;

  /**
   * FullscreenManager Constructor.
   *
   * @param container the container of interest
   */
  constructor (container: HTMLElement)
  {
    super();

    this.container = container;

    this.handleFullscreenChangeListener = this.handleFullscreenChange.bind(this);

    // Add fullscreen change listeners
    document.addEventListener('fullscreenchange', this.handleFullscreenChangeListener);
  }

  /**
   * Toggle fullscreen mode of container.
   */
  toggleFullscreen (): void
  {
    if (this.container === UIUtil.getFullscreenElement()) {
      UIUtil.cancelFullscreen();
    } else {
      UIUtil.requestFullscreenFor(this.container);
    }

    // Publish change event
    this.dispatchEvent('change', {});
  }

  /**
   * Request fullscreen mode for container.
   */
  requestFullscreen (): void
  {
    if (this.container !== UIUtil.getFullscreenElement()) {
      UIUtil.requestFullscreenFor(this.container);

      // Publish change event
      this.dispatchEvent('change', {});
    }
  }

  /**
   * Cancel fullscreen mode for container.
   */
  cancelFullscreen (): void
  {
    if (this.container === UIUtil.getFullscreenElement()) {
      UIUtil.cancelFullscreen();

      // Publish change event
      this.dispatchEvent('change', {});
    }
  }

  /**
   * Check if the container is currently in fullscreen mode.
   * 
   * @returns true, if in fullscreen mode, false otherwise
   */
  isFullscreen (): boolean
  {
    return this.container === UIUtil.getFullscreenElement();
  }

  /**
   * The callback triggered when the window enters / leaves fullscreen.
   *
   * @param event the event
   */
  handleFullscreenChange (event: Event): void
  {
    // Publish change event
    this.dispatchEvent('change', {});
  }
}

export { FullscreenManager };
