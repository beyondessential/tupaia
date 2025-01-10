function ease(v: number, pow = 3) {
  return 1 - Math.pow(1 - v, pow);
}

export const createScaleKeyFrameAnimation = ({ x = 0.5, y = 0, easeFn = ease }) => {
  // Figure out the size of the element when collapsed.
  let animation = '';
  let inverseAnimation = '';

  for (let step = 0; step <= 100; step++) {
    // Remap the step value to an eased one.
    const easedStep = easeFn(step / 100);

    // Calculate the scale of the element.
    const xScale = x + (1 - x) * easedStep;
    const yScale = y + (1 - y) * easedStep;

    animation += `${step}% {
      transform: scale(${xScale}, ${yScale});
    }`;

    // And now the inverse for the contents.
    const invXScale = 1 - xScale;
    const invYScale = 1 - yScale;
    inverseAnimation += `${step}% {
      transform: scale(${invXScale}, ${invYScale});
    }`;
  }

  return `
  @keyframes openAnimation {
    ${animation}
  }

  @keyframes closeAnimation {
    ${inverseAnimation}
  }`;
};
