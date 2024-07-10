import { ElProps, UIUtil } from '../../utils/UIUtil';

class Panel
{
  /** The component root element. */
  readonly domElement: HTMLDivElement;

  /** Visibility change listener */
  onVisibilityChanged: ((panel: Panel) => any ) | undefined;

  /**
   * Panel Constructor
   *
   * @param props the element properties
   */
  constructor (props: ElProps = undefined)
  {
    this.domElement = UIUtil.el('div', props);
    this.onVisibilityChanged = undefined;
  }

  /**
   * Add (append) the given element to the panel.
   *
   * @param element the element to add/append
   */
  appendChild (element: HTMLElement): void
  {
    this.domElement.appendChild(element);
  }

  /**
   * Remove the given element from the panel.
   *
   * @param element the element to remove
   */
  removeChild (element: HTMLElement): void
  {
    this.domElement.removeChild(element);
  }

  /**
   * Set this component visible or invisible.
   *
   * @param visible true for visible, false for invisible
   */
  setVisible (visible: boolean = true): void
  {
    const isVisible = UIUtil.isVisible(this.domElement);

    if (isVisible !== visible) {
      UIUtil.setVisibility(this.domElement, visible);
      if (this.onVisibilityChanged) {
        this.onVisibilityChanged(this);
      }
    }
  }

  /**
   * Toggle visibility of panel.
   */
  toggleVisibility (): void
  {
    const newVal = !UIUtil.isVisible(this.domElement);

    UIUtil.setVisibility(this.domElement, newVal);
      if (this.onVisibilityChanged) {
        this.onVisibilityChanged(this);
      }
  }

  /**
   * Check if this component is currently visible.
   *
   * @returns true for visible, false for invisible
   */
  isVisible (): boolean
  {
    return UIUtil.isVisible(this.domElement);
  }
}

export { Panel };
