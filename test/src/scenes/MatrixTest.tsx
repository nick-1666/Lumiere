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
        [0.2, 0.5, 0.2],
        [0.5, 1, 0.5],
        [0.2, 0.5, 0.2],
      ]}
      y={-250}
      name="weights"
      suffix=""
      suffixColor={colors.red}
      align={Align.Top}
    />,
  );

  yield* waitFor(0.5);
  yield* valueArr().highlight([1, 1], {Color: colors.NUMBER});
  yield* valueArr().swapAndHighlight([1, 1], [0, 0], {Color: colors.KEYWORD});
  yield* valueArr().swapAndHighlight([1, 1], [0, 0], {Color: colors.NUMBER});
});
