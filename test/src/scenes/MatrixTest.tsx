import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import {createRef} from '@motion-canvas/core/lib/utils';
import {colors} from '@components/Styles';
import {Align, Matrix} from '@components/matrix';
import {HighlightSubject} from '@components/array/ArrayEntry';

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
      y={20}
      name="weights"
      suffix=""
      suffixColor={colors.red}
      align={Align.Top}
    />,
  );

  yield* waitFor(0.5);
  yield* all(
    valueArr().highlight([1, 1], {Color: colors.blue}),
    valueArr().highlight([2, 2], {Color: colors.blue}),
  );
  yield* waitFor(0.5);
  yield* all(
    valueArr().highlight([1, 1], {Color: colors.background}),
    valueArr().highlight([2, 2], {Color: colors.green}),
  );
  yield* waitFor(0.5);
  yield* valueArr().highlight([2, 2], {Color: colors.background});

  yield* waitFor(1);

  yield* valueArr().swapAndHighlight([1, 1], [0, 0], {Color: colors.red});
  yield* waitFor(0.5);
  yield* valueArr().swapAndHighlight([1, 1], [0, 0], {Color: colors.red});
  yield* waitFor(1);
  yield* valueArr().swapAndHighlight([1, 0], [0, 2], {Color: colors.red});
  yield* waitFor(0.5);
});
