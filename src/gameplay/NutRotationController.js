/**
 * NutRotationController.js
 *
 * Manages angular orientation, phase alignment, and rotation dynamics for:
 * 1. Resting stacked nuts on bolts (thread pitch phase alignment)
 * 2. Selected hovering nuts (synchronized unscrew lift & gentle mechanical breath)
 * 3. Airborne transfer nuts (rotational momentum & banking tilt)
 * 4. Destination screwing down nuts (tightening rotation into thread seat)
 */

export class NutRotationController {
  constructor(screwController) {
    this.screwController = screwController;
  }

  /**
   * Calculates the natural resting rotation angle for a nut in a stack,
   * perfectly in phase with its vertical position along the spiral thread.
   *
   * @param {number} layerIndex - 0 is bottom nut, 1, 2, 3...
   * @param {number} stepY - Distance between stacked nuts (pixels)
   * @returns {number} Angle in radians
   */
  getRestingAngle(layerIndex, stepY = 24) {
    const pitch = this.screwController.getPitch();
    // Angular phase corresponding to layer elevation: theta = (2π / P) * (l * stepY)
    const threadAngle = ((2 * Math.PI) / pitch) * (layerIndex * stepY);
    // Subtle realistic manufacturing tolerance offset (~6°)
    const toleranceOffset = ((layerIndex * 13) % 360) * (Math.PI / 180) * 0.15;
    return (threadAngle + toleranceOffset) % (Math.PI * 2);
  }

  /**
   * Calculates rotation for the selected top nut as it unscrews and hovers
   *
   * @param {number} restingAngle - Resting angle before lift
   * @param {number} currentLift - Current lift distance (pixels)
   * @param {number} totalLiftPx - Maximum lift height (pixels)
   * @param {number} time - Global elapsed time for subtle idle vibration
   * @returns {number} Angle in radians
   */
  getSelectedHoverAngle(restingAngle, currentLift, totalLiftPx, time = 0) {
    const pitch = this.screwController.getPitch();
    // Unscrew rotation strictly proportional to vertical lift: deltaTheta = -(2π / P) * currentLift
    const unscrewAngle = -((2 * Math.PI) / pitch) * currentLift;
    // When fully lifted, add subtle mechanical idle hover vibration
    const liftFraction = Math.max(0, Math.min(1, currentLift / Math.max(1, totalLiftPx)));
    const hoverWobble = Math.sin(time * 5.0) * 0.035 * liftFraction;
    return restingAngle + unscrewAngle + hoverWobble;
  }

  /**
   * Calculates rotation during the parabolic flight phase between bolts
   *
   * @param {number} releaseAngle - Rotation angle at the moment of clearing the source bolt
   * @param {number} subProgress - Progress from 0 to 1 during flight
   * @param {number} fromX - Source X
   * @param {number} toX - Destination X
   * @returns {number} Angle in radians
   */
  getFlightAngle(releaseAngle, subProgress, fromX, toX) {
    // Continuous rotational inertia in flight (smooth 1.5 - 2 turns)
    const flightSpin = subProgress * Math.PI * 2.2;
    // Aerodynamic banking tilt in the direction of flight
    const travelDir = toX >= fromX ? 1 : -1;
    const bankingTilt = travelDir * Math.sin(subProgress * Math.PI) * 0.18;
    return releaseAngle + flightSpin + bankingTilt;
  }

  /**
   * Calculates rotation while threading down onto the destination bolt
   *
   * @param {number} entryAngle - Angle when starting to screw down onto destination
   * @param {number} targetRestAngle - Final resting angle when seated
   * @param {number} subProgress - Progress from 0 to 1 of downward screwing
   * @param {number} descendHeightPx - Total vertical distance traveled down
   * @returns {number} Angle in radians
   */
  getScrewDownAngle(entryAngle, targetRestAngle, subProgress, descendHeightPx) {
    const pitch = this.screwController.getPitch();
    // Total tightening turns needed to cover descendHeightPx:
    const totalTighteningAngle = ((2 * Math.PI) / pitch) * descendHeightPx;
    // Rotates clockwise as it descends:
    const currentAngle = entryAngle + totalTighteningAngle * subProgress;
    return currentAngle;
  }
}

