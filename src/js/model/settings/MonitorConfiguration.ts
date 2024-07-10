import { ConfigurationModel } from './ConfigurationModel';
import { Color } from 'three';
import { EventDispatcher, GPropertyChangeEvent } from '../../utils/EventDispatcher';


/** The monitor configuration model event map interface. */
export interface MonitorConfigurationEventMap {
  'change': GPropertyChangeEvent;
}

/**
 * The monitor configuration property enum.
 */
export const enum MonitorConfigurationProperties {
  TEAM_COLORS_ENABLED = 'teamColorsEnabled',
  TEAM_COLOR_LEFT = 'teamColorLeft',
  TEAM_COLOR_RIGHT = 'teamColorRight',
  INTERPOLATE_STATES = 'interpolateStates',
  SHADOWS_ENABLED = 'shadowsEnabled',
  GL_INFO_ENABLED = 'glInfoEnabled'
}

/**
 * The MonitorConfiguration class definition.
 *
 * The MonitorConfiguration provides
 *
 * @author Stefan Glaser
 */
class MonitorConfiguration extends EventDispatcher<MonitorConfigurationEventMap> implements ConfigurationModel
{
  /** Use user defined team colors? */
  teamColorsEnabled: boolean;

  /** User defined color for the left team. */
  leftTeamColor: Color;

  /** User defined color for the right team. */
  rightTeamColor: Color;

  /** Interpolate world states? */
  interpolateStates: boolean;

  /** Are shadows enabled? */
  shadowsEnabled: boolean;

  /** Show gl panel info? */
  glInfoEnabled: boolean;

  /**
   * MonitorConfiguration Constructor
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   * ::implements {IConfiguration}
   */
  constructor()
  {
    super();

    this.teamColorsEnabled = false;
    this.leftTeamColor = new Color('#cccc00');
    this.rightTeamColor = new Color('#008fff');
    this.interpolateStates = true;
    this.shadowsEnabled = false;
    this.glInfoEnabled = false;
  }

  /**
   * @override
   * @returns
   */
  getID (): string
  {
    return 'monitorConfig';
  }

  /**
   * @override
   * @returns
   */
  toJSONString (): string
  {
    const obj: Record<string, any> = {};

    // Store properties
    obj[MonitorConfigurationProperties.TEAM_COLORS_ENABLED] = this.teamColorsEnabled;
    obj[MonitorConfigurationProperties.TEAM_COLOR_LEFT] = this.leftTeamColor.getHex();
    obj[MonitorConfigurationProperties.TEAM_COLOR_RIGHT] = this.rightTeamColor.getHex();
    obj[MonitorConfigurationProperties.INTERPOLATE_STATES] = this.interpolateStates;
    obj[MonitorConfigurationProperties.SHADOWS_ENABLED] = this.shadowsEnabled;
    obj[MonitorConfigurationProperties.GL_INFO_ENABLED] = this.glInfoEnabled;

    return JSON.stringify(obj);
  }

  /**
   * Restore this configuration from persistance string.
   *
   * @override
   * @param jsonString a stringified version of this configuration
   */
  fromJSONString (jsonString: string): void
  {
    try {
      const obj = JSON.parse(jsonString);

      // Read values
      let value = obj[MonitorConfigurationProperties.TEAM_COLORS_ENABLED];
      if (value !== undefined) {
        this.teamColorsEnabled = value;
      }

      value = obj[MonitorConfigurationProperties.TEAM_COLOR_LEFT];
      if (value !== undefined) {
        this.leftTeamColor = new Color(value);
      }

      value = obj[MonitorConfigurationProperties.TEAM_COLOR_RIGHT];
      if (value !== undefined) {
        this.rightTeamColor = new Color(value);
      }

      value = obj[MonitorConfigurationProperties.INTERPOLATE_STATES];
      if (value !== undefined) {
        this.interpolateStates = value;
      }

      value = obj[MonitorConfigurationProperties.SHADOWS_ENABLED];
      if (value !== undefined) {
        this.shadowsEnabled = value;
      }

      value = obj[MonitorConfigurationProperties.GL_INFO_ENABLED];
      if (value !== undefined) {
        this.glInfoEnabled = value;
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  /**
   * Enable/Disable usage of user defined team colors.
   *
   * @param value true for enabled, false for disabled
   */
  setTeamColorsEnabled (value: boolean): void
  {
    if (this.teamColorsEnabled !== value) {
      this.teamColorsEnabled = value;

      // Publish change event
      this.dispatchEvent('change', {
        property: MonitorConfigurationProperties.TEAM_COLORS_ENABLED
      });
    }
  }

  /**
   * Store the given color as the user defined color for the left team.
   *
   * @param color the user defined team color
   * @param leftSide true if the color is for the left team, false for the right team
   */
  setTeamColor (color: string, leftSide: boolean): void
  {
    if (leftSide) {
      this.leftTeamColor = new Color(color);

      // Publish change event
      this.dispatchEvent('change', {
        property: MonitorConfigurationProperties.TEAM_COLOR_LEFT,
      });
    } else {
      this.rightTeamColor = new Color(color);

      // Publish change event
      this.dispatchEvent('change', {
        property: MonitorConfigurationProperties.TEAM_COLOR_RIGHT,
      });
    }
  }

  /**
   * Read the user defined color for a team.
   *
   * @param leftSide true for left side, false for right side
   * @returns the user defined team color
   */
  getTeamColor (leftSide: boolean): Color
  {
    return leftSide ? this.leftTeamColor : this.rightTeamColor;
  }

  /**
   * @param value
   */
  setInterpolateStates (value: boolean): void
  {
    if (this.interpolateStates !== value) {
      this.interpolateStates = value;

      // Publish change event
      this.dispatchEvent('change', {
        property: MonitorConfigurationProperties.INTERPOLATE_STATES,
      });
    }
  }

  /**
   * @param value
   */
  setShadowsEnabled (value: boolean): void
  {
    if (this.shadowsEnabled !== value) {
      this.shadowsEnabled = value;

      // Publish change event
      this.dispatchEvent('change', {
        property: MonitorConfigurationProperties.SHADOWS_ENABLED,
      });
    }
  }

  /**
   * @param value
   */
  setGLInfoEnabled (value: boolean): void
  {
    if (this.glInfoEnabled !== value) {
      this.glInfoEnabled = value;

      // Publish change event
      this.dispatchEvent('change', {
        property: MonitorConfigurationProperties.GL_INFO_ENABLED,
      });
    }
  }
}

export { MonitorConfiguration };
