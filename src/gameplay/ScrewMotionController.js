/**
 * ScrewMotionController.js
 *
 * Implements realistic helical screw motion kinematics according to:
 *   θ(t) = θ₀ + ωt
 *   y(t) = y₀ ± (P / 2π) × (θ(t) - θ₀)
 *
 * Where:
 *   - θ: Rotation angle (radians)
 *   - ω: Angular velocity (rad/s)
 *   - P: Thread pitch (pixels per 2π revolution)
 *   - y: Vertical position (pixels)
 *   - t: Elapsed time (seconds)
 *
 * Enforces strict mathematical synchronization between vertical displacement
 * and axial rotation for all unscrewing and screwing actions.
 */

export class ScrewMotionController {
  /**
   * @param {number} pitch - Thread pitch P in pixels per full turn (2*PI rad)
   */
  constructor(pitch = 28) {
    this.pitch = Math.max(1, pitch);
  }

  /**
   * Updates thread pitch
   * @param {number} p
   */
  setPitch(p) {
    this.pitch = Math.max(1, p);
  }

  getPitch() {
    return this.pitch;
  }

  /**
   * Calculate vertical position from rotation angle:
   * y(t) = y0 + direction * (P / 2π) * (theta(t) - theta0)
   *
   * @param {number} y0 - Initial vertical position
   * @param {number} theta0 - Initial rotation angle (radians)
   * @param {number} theta - Current rotation angle (radians)
   * @param {number} direction - +1 for downward tightening, -1 for upward loosening
   * @returns {number}
   */
  calcYFromTheta(y0, theta0, theta, direction = 1) {
    const deltaTheta = theta - theta0;
    return y0 + direction * (this.pitch / (2 * Math.PI)) * deltaTheta;
  }

  /**
   * Calculate rotation angle required for vertical displacement:
   * deltaTheta = direction * (2π / P) * |deltaY|
   *
   * @param {number} theta0 - Initial rotation angle (radians)
   * @param {number} y0 - Initial vertical position
   * @param {number} y - Current vertical position
   * @param {number} direction - -1 for counter-clockwise unscrewing, +1 for clockwise screwing
   * @returns {number}
   */
  calcThetaFromY(theta0, y0, y, direction = 1) {
    const deltaY = y - y0;
    return theta0 + direction * ((2 * Math.PI) / this.pitch) * Math.abs(deltaY);
  }

  /**
   * Smooth easing function (cubic acceleration & deceleration)
   */
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /**
   * Evaluates the instantaneous helical motion state for an upward or downward movement
   *
   * @param {number} elapsedSec - Elapsed time in seconds
   * @param {number} totalDurationSec - Total duration of the motion phase
   * @param {number} startY - Starting vertical coordinate
   * @param {number} targetY - Destination vertical coordinate
   * @param {number} startTheta - Starting rotation angle (radians)
   * @param {'unscrew'|'screw'} mode - Motion mode
   * @returns {{ progress: number, y: number, theta: number, omega: number, vy: number, isComplete: boolean }}
   */
  evaluateHelicalMotion(elapsedSec, totalDurationSec, startY, targetY, startTheta = 0, mode = 'unscrew') {
    const rawProgress = Math.max(0, Math.min(1, elapsedSec / Math.max(0.001, totalDurationSec)));
    const easedProgress = this.easeInOutCubic(rawProgress);

    const deltaYTotal = targetY - startY;
    const currentY = startY + deltaYTotal * easedProgress;

    // Mathematical screw relationship:
    // deltaTheta = (2π / P) * |deltaY|
    const totalRotationAngle = ((2 * Math.PI) / this.pitch) * Math.abs(deltaYTotal);
    const rotationSign = mode === 'unscrew' ? -1 : 1;
    const currentTheta = startTheta + rotationSign * totalRotationAngle * easedProgress;

    // Instantaneous velocities (dTheta/dt and dy/dt)
    const dt = 0.005;
    const nextProg = Math.min(1.0, rawProgress + dt);
    const dEased = (this.easeInOutCubic(nextProg) - easedProgress) / dt;
    const vy = deltaYTotal * (dEased / totalDurationSec);
    const omega = rotationSign * totalRotationAngle * (dEased / totalDurationSec);

    return {
      progress: rawProgress,
      easedProgress,
      y: currentY,
      theta: currentTheta,
      omega,
      vy,
      isComplete: rawProgress >= 1.0,
    };
  }
}

export const defaultScrewController = new ScrewMotionController(28);

