import { Panel } from './Panel';
import { UIUtil } from '../../utils/UIUtil';

class PanelGroup
{
  /** The list of panels in this group. */
  panels: Panel[];


  /** The currently active panel. */
  activePanel?: Panel;

  /** Panel visibility change listener. */
  visibilityListener: (panel: Panel) => any;

  /**
   * PanelGroup Constructor
   */
  constructor ()
  {
    this.panels = [];
    this.activePanel = undefined;

    // -------------------- Listeners -------------------- //
    this.visibilityListener = this.onVisibilityChanged.bind(this);
  }

  /**
   * Add the given panel to the group.
   *
   * @param panel the panel to add
   */
  add (panel: Panel): void
  {
    // Check if panel is already in the list of panels
    if (this.panels.indexOf(panel) !== -1) {
      return;
    }

    // Hide new panel
    UIUtil.setVisibility(panel.domElement, false);

    // Add new panel to group list
    this.panels.push(panel);

    // Add visibility change listener
    panel.onVisibilityChanged = this.visibilityListener;
  }



  /**
   * Check if this group has an active (visible) panel.
   *
   * @return true if an panel in this group is active (visible), false otherwise
   */
  hasActivePanel (): boolean
  {
    return !!this.activePanel;
  }



  /**
   * Hide all (the currently active) panel.
   */
  hideAll (): void
  {
    if (this.activePanel) {
      UIUtil.setVisibility(this.activePanel.domElement, false);
      this.activePanel = undefined;
    }
  }



  /**
   * Panel visibility change listener.
   *
   * @param panel the panel which visibility changed
   */
  onVisibilityChanged (panel: Panel): void
  {
    if (panel.isVisible()) {
      for (let i = 0; i < this.panels.length; i++) {
        if (this.panels[i] !== panel) {
          UIUtil.setVisibility(this.panels[i].domElement, false);
        }
      }

      this.activePanel = panel;
    } else if (this.activePanel === panel) {
      this.activePanel = undefined;
    }
  }
}

export { PanelGroup };
