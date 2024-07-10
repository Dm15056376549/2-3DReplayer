import { Overlay } from '../../components/Overlay';
import { MonitorConfiguration, MonitorConfigurationProperties } from '../../../model/settings/MonitorConfiguration';
import { SingleChoiceItem } from '../../components/SingleChoiceItem';
import { ToggleItem } from '../../components/ToggleItem';
import { UIUtil } from '../../../utils/UIUtil';
import { GPropertyChangeEvent } from '../../../utils/EventDispatcher';

/**
 * The SettingsOverlay class definition.
 *
 * @author Stefan Glaser
 */
class SettingsOverlay extends Overlay
{
  /** The monitor config. */
  config: MonitorConfiguration;

  /** The main menu list. */
  mainMenu: HTMLUListElement;

  /** The interpolate state item. */
  interpolateItem: ToggleItem;

  /** The shadows enabeld state item. */
  shadowsItem: ToggleItem;

  /** The monitor statistics state item. */
  statisticsItem: ToggleItem;

  /** The team colors enabled state item. */
  teamColorsItem: ToggleItem;

  /** The team color chooser item. */
  teamColorChooserItem: HTMLDivElement;

  /** The left team color chooser. */
  leftTeamColorChooser: HTMLInputElement;

  /** The right team color chooser. */
  rightTeamColorChooser: HTMLInputElement;

  /**
   * SettingsOverlay Constructor
   *
   * @param config the monitor config
   */
  constructor (config: MonitorConfiguration)
  {
    super({cls: 'jsm-settings'});
    const scope = this;

    this.config = config;

    this.mainMenu = UIUtil.el('ul', { parent: this.innerElement, cls: 'jsm-menu' });

    this.interpolateItem = new ToggleItem('Interpolation', 'On', 'Off', config.interpolateStates, 'item');
    this.interpolateItem.onChanged = function() {
      config.setInterpolateStates(scope.interpolateItem.isOn());
    };
    this.mainMenu.appendChild(this.interpolateItem.domElement);

    this.shadowsItem = new ToggleItem('Shadows', 'On', 'Off', config.shadowsEnabled, 'item');
    this.shadowsItem.onChanged = function() {
      config.setShadowsEnabled(scope.shadowsItem.isOn());
    };
    this.mainMenu.appendChild(this.shadowsItem.domElement);

    this.statisticsItem = new ToggleItem('Monitor Statistics', 'On', 'Off', config.glInfoEnabled, 'item');
    this.statisticsItem.onChanged = function() {
      config.setGLInfoEnabled(scope.statisticsItem.isOn());
    };
    this.mainMenu.appendChild(this.statisticsItem.domElement);

    this.teamColorsItem = new ToggleItem('Team Colors', 'Fix', 'Auto', config.teamColorsEnabled, 'item');
    this.teamColorsItem.onChanged = function() {
      const isOn = scope.teamColorsItem.isOn();
      config.setTeamColorsEnabled(isOn);
      scope.teamColorChooserItem.style.height = isOn ? scope.teamColorChooserItem.scrollHeight + 'px' : '0px';
    };
    this.mainMenu.appendChild(this.teamColorsItem.domElement);

    this.teamColorChooserItem = UIUtil.el('div', { parent: this.teamColorsItem.domElement, cls: 'collapsable' });
    this.teamColorChooserItem.onclick = function(event) { event.stopPropagation(); };

    if (!config.teamColorsEnabled) {
      this.teamColorChooserItem.style.height = '0px';
    }

    this.leftTeamColorChooser = UIUtil.createColorChooser('#' + config.leftTeamColor.getHexString(), 'Left team color', 'team-color');
    this.leftTeamColorChooser.onchange = function() {
      config.setTeamColor(scope.leftTeamColorChooser.value, true);
    };

    this.rightTeamColorChooser = UIUtil.createColorChooser('#' + config.rightTeamColor.getHexString(), 'Right team color', 'team-color');
    this.rightTeamColorChooser.onchange = function() {
      config.setTeamColor(scope.rightTeamColorChooser.value, false);
    };
    this.teamColorChooserItem.appendChild(this.leftTeamColorChooser);
    this.teamColorChooserItem.appendChild(this.rightTeamColorChooser);

    // Add config change listeners
    this.config.addEventListener('change', this.handleConfigChange, this);
  }

  /**
   * Handle configuration change.
   *
   * @param evt the property change event
   */
  handleConfigChange (evt: GPropertyChangeEvent): void
  {
    switch (evt.property) {
      case MonitorConfigurationProperties.INTERPOLATE_STATES:
        this.applyInterpolationSettings();
        break;
      case MonitorConfigurationProperties.TEAM_COLORS_ENABLED:
      case MonitorConfigurationProperties.TEAM_COLOR_LEFT:
      case MonitorConfigurationProperties.TEAM_COLOR_RIGHT:
        this.applyTeamColorSettings();
        break;
      case MonitorConfigurationProperties.SHADOWS_ENABLED:
        this.applyShadowSettings();
        break;
      case MonitorConfigurationProperties.GL_INFO_ENABLED:
        this.applyGLInfoSettings();
        break;
    }
  }

  /**
   * Apply team color settings.
   */
  applyTeamColorSettings (): void
  {
    const isOn = this.config.teamColorsEnabled;

    this.teamColorsItem.setState(isOn);
    this.teamColorChooserItem.style.height = isOn ? this.teamColorChooserItem.scrollHeight + 'px' : '0px';
    this.leftTeamColorChooser.value = '#' + this.config.leftTeamColor.getHexString();
    this.rightTeamColorChooser.value = '#' + this.config.rightTeamColor.getHexString();
  }

  /**
   * Apply shadow setting.
   */
  applyShadowSettings (): void
  {
    this.shadowsItem.setState(this.config.shadowsEnabled);
  }

  /**
   * Apply interpolate states setting.
   */
  applyInterpolationSettings (): void
  {
    this.interpolateItem.setState(this.config.interpolateStates);
  }

  /**
   * Apply monitor info settings.
   */
  applyGLInfoSettings (): void
  {
    this.statisticsItem.setState(this.config.glInfoEnabled);
  }
}

export { SettingsOverlay };
