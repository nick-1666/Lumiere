import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor} from '@motion-canvas/core/lib/flow';
import {createRef} from '@motion-canvas/core/lib/utils';
import {colors} from '@components/Styles';
import {Align, Matrix} from '@components/matrix';

export default makeScene2D(function* (view) {
  const valueArr = createRef<Matrix>();

  view.add(
    <Matrix
      ref={valueArr}
      values={[
        [1, 2, 3],
        [6, 8, 6],
        [5, 7, 6],
      ]}
      y={-250}
      name="value"
      suffix={'&Str'}
      suffixColor={colors.red}
      align={Align.Top}
    />,
  );

  yield* waitFor(0.5);
  yield* valueArr().highlight([1, 1], {Color: colors.NUMBER});
});
